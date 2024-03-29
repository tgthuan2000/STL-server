import { uuid } from "@sanity/uuid";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { get } from "lodash";
import { ROLE } from "~/constant/role";
import { client } from "~/plugin/sanity";
import {
    getAccessByRefreshToken,
    getAllRefreshTokenByUserId,
    getPasswordByUserId,
    getRefreshTokenByJwt,
} from "~/schema/api/auth";

dotenv.config();

export const comparePassword = async (_id: string, password: string) => {
    const data = await getPasswordByUserId(_id);
    const isMatch = bcrypt.compareSync(password, data.password);
    return isMatch;
};

export const saveToken = async (
    _id: string,
    token: {
        accessToken: string;
        refreshToken: { token: string; device: string };
    }
) => {
    try {
        if (!token.accessToken || !token.refreshToken) {
            return;
        }

        const transaction = client.transaction();
        const refreshTokenId = uuid();
        const accessTokenId = uuid();
        const accessTokenExpired = getExpiredDate(ACCESS_TOKEN_EXPIRED_HOURS);
        const refreshTokenExpired = getExpiredDate(REFRESH_TOKEN_EXPIRED_HOURS);

        // create access token
        const accessToken = {
            _type: "accessToken",
            _id: accessTokenId,
            token: token.accessToken,
            expiredAt: accessTokenExpired,
            refreshToken: {
                _ref: refreshTokenId,
                _type: "reference",
            },
        };
        transaction.createIfNotExists(accessToken);

        // create refresh token
        const refreshToken = {
            _type: "refreshToken",
            _id: refreshTokenId,
            token: token.refreshToken.token,
            device: token.refreshToken.device,
            expiredAt: refreshTokenExpired,
            lastAccess: new Date(),
            user: {
                _ref: _id,
                _type: "reference",
            },
        };
        transaction.createIfNotExists(refreshToken);

        const response = await transaction.commit();
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const saveNewAccessToken = async (
    _id: string,
    token: { accessToken: string; refreshToken: string }
) => {
    try {
        if (!token.accessToken || !token.refreshToken) {
            return;
        }

        const transaction = client.transaction();
        const expiredAt = getExpiredDate(ACCESS_TOKEN_EXPIRED_HOURS);
        const id = uuid();

        // create access token
        const accessToken = {
            _type: "accessToken",
            _id: id,
            token: token.accessToken,
            expiredAt,
            refreshToken: {
                _ref: token.refreshToken,
                _type: "reference",
            },
        };
        transaction.createIfNotExists(accessToken);

        // update lastAccess refresh token
        const refreshToken = client.patch(token.refreshToken, {
            set: { lastAccess: new Date() },
        });
        transaction.patch(refreshToken);

        const response = await transaction.commit();
        return response;
    } catch (error) {
        console.log(error);
    }
};

const getExpiredTimeEnv = (env: string, defaultValue: number = 1) => {
    return env ? Number(env) : defaultValue;
};

const ACCESS_TOKEN_EXPIRED_HOURS = getExpiredTimeEnv(
    process.env.ACCESS_TOKEN_EXPIRED_HOURS,
    1
);

const REFRESH_TOKEN_EXPIRED_HOURS = getExpiredTimeEnv(
    process.env.REFRESH_TOKEN_EXPIRED_HOURS,
    720
);

const getExpiredDate = (hours: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date;
};

const createToken = (_id: string, expiresIn: string | number = "1h") => {
    const token = jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn,
    });
    return token;
};

export const createAccessRefreshToken = async (
    _id: string,
    options: { device: string }
) => {
    const accessToken = createToken(_id, ACCESS_TOKEN_EXPIRED_HOURS + "h");
    const refreshToken = createToken(_id, REFRESH_TOKEN_EXPIRED_HOURS + "h");

    await saveToken(_id, {
        accessToken,
        refreshToken: { token: refreshToken, device: options.device ?? "" },
    });

    return { accessToken, refreshToken };
};

export const createNewAccessToken = async (
    _id: string,
    refreshTokenId: string
) => {
    const accessToken = createToken(_id, ACCESS_TOKEN_EXPIRED_HOURS + "h");
    await saveNewAccessToken(_id, {
        accessToken,
        refreshToken: refreshTokenId,
    });
    return { accessToken };
};

export const revokeTokenAll = async (userId: string) => {
    try {
        if (!userId) {
            return;
        }

        const transaction = client.transaction();
        const refreshTokens = await getAllRefreshTokenByUserId(userId);

        refreshTokens.forEach((refreshToken) => {
            transaction.delete(refreshToken._id);
            refreshToken.accessTokens.forEach((token) => {
                transaction.delete(token._id);
            });
        });

        const response = await transaction.commit();
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const revokeToken = async (refreshTokenId: string) => {
    try {
        if (!refreshTokenId) {
            return;
        }

        const transaction = client.transaction();
        const accessTokens = await getAccessByRefreshToken(refreshTokenId);

        transaction.delete(refreshTokenId);
        accessTokens?.forEach((token) => {
            transaction.delete(token._id);
        });

        const response = await transaction.commit();
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const revokeTokenJwt = async (refreshTokenJwt: string) => {
    try {
        if (!refreshTokenJwt) {
            return;
        }

        const transaction = client.transaction();
        const refreshToken = await getRefreshTokenByJwt(refreshTokenJwt);

        transaction.delete(refreshToken._id);
        refreshToken.accessTokens?.forEach((token) => {
            transaction.delete(token._id);
        });

        const response = await transaction.commit();
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const getTokenIndex = (data: undefined | string[], token: string) => {
    if (!token) {
        return -1;
    }
    const index = data?.findIndex((t: string) => t === token) ?? -1;
    return index;
};

export const getUserToken = (req: Request) => {
    // @ts-ignore
    return get(req, "token", null);
};

export const getUserId = (req: Request) => {
    // @ts-ignore
    return get(req, "accessToken._id", null);
};

export const getUserAgent = (req: Request) => {
    return req.headers["user-agent"] ?? "";
};

export const signInGoogle = async (data: any) => {
    const { sub, picture, name, email } = data;
    const document = {
        _type: "user",
        _id: sub,
        image: picture,
        userName: name,
        email,
        google: JSON.stringify(data),
        allowSendMail: true,
        role: {
            _type: "reference",
            _ref: ROLE.CLIENT,
        },
        active: true,
    };

    const d = await client.createIfNotExists(document);
    return d;
};
