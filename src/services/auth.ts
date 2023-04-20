import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { get } from "lodash";
import moment from "moment";
import { ROLE } from "~/constant/role";
import { client } from "~/plugin/sanity";
import {
    GET_ACCESS_TOKEN_BY_REFRESH_TOKEN,
    GET_ACTIVE_USER_2FA_BY_ID,
    GET_BASE32_BY_EMAIL,
    GET_PASSWORD_BY_ID,
    GET_REFRESH_TOKEN_ID_BY_JWT,
    GET_USER_2FA_BY_ID,
    GET_USER_ACCESS_TOKEN,
    GET_USER_BASE32_2FA_BY_ID,
    GET_USER_EMAIL_BY_ID,
    GET_USER_ID_BASE32_BY_ID,
    GET_USER_REFRESH_TOKEN,
} from "~/schema/query/auth";

dotenv.config();

export const comparePassword = async (_id: string, password: string) => {
    const data = await client.fetch<{ password: string }>(GET_PASSWORD_BY_ID, {
        _id,
    });
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

        // create access token
        const accessToken = {
            _type: "accessToken",
            _id: token.accessToken,
            refreshToken: {
                _ref: token.refreshToken.token,
                _type: "reference",
            },
        };
        transaction.createIfNotExists(accessToken);

        // create refresh token
        const refreshToken = {
            _type: "refreshToken",
            token: token.refreshToken.token,
            device: token.refreshToken.device,
            lastAccess: moment().format(),
            user: {
                _ref: _id,
                _type: "reference",
            },
        };
        transaction.create(refreshToken);

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

        // create access token
        const accessToken = {
            _type: "accessToken",
            _id: token.accessToken,
            refreshToken: {
                _ref: token.refreshToken,
                _type: "reference",
            },
        };
        transaction.createIfNotExists(accessToken);

        // update lastAccess refresh token
        const refreshToken = client.patch(token.refreshToken, {
            set: { lastAccess: moment().format() },
        });
        transaction.patch(refreshToken);

        const response = await transaction.commit();
        return response;
    } catch (error) {
        console.log(error);
    }
};

const ACCESS_TOKEN_EXPIRED_TIME = "1h";
const REFRESH_TOKEN_EXPIRED_TIME = "720h";
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
    const accessToken = createToken(_id, ACCESS_TOKEN_EXPIRED_TIME);
    const refreshToken = createToken(_id, REFRESH_TOKEN_EXPIRED_TIME);

    await saveToken(_id, {
        accessToken,
        refreshToken: { token: refreshToken, device: options.device ?? "" },
    });

    return { accessToken, refreshToken };
};

export const createNewAccessToken = async (
    _id: string,
    refreshToken: string
) => {
    const accessToken = createToken(_id, ACCESS_TOKEN_EXPIRED_TIME);
    await saveNewAccessToken(_id, { accessToken, refreshToken });
    return { accessToken };
};

export const verifyRefreshToken = async (_id: string, token: string) => {
    const data = await client.fetch<{ _id: string }>(GET_USER_REFRESH_TOKEN, {
        _id,
        token,
    });
    return Boolean(data);
};

export const getAccessByRefreshToken = async (refreshToken: string) => {
    const data = await client.fetch<Array<{ _id: string }>>(
        GET_ACCESS_TOKEN_BY_REFRESH_TOKEN,
        { token: refreshToken }
    );
    return data;
};

export const getRefreshTokenIdByJwt = async (refreshTokenJwt: string) => {
    const data = await client.fetch<string>(GET_REFRESH_TOKEN_ID_BY_JWT, {
        jwt: refreshTokenJwt,
    });
    return data;
};

export const revokeToken = async (refreshToken: string) => {
    try {
        if (!refreshToken) {
            return;
        }

        const transaction = client.transaction();

        transaction.delete(refreshToken);

        const accessTokens = await getAccessByRefreshToken(refreshToken);

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

        const refreshToken = await getRefreshTokenIdByJwt(refreshTokenJwt);

        transaction.delete(refreshToken);

        const accessTokens = await getAccessByRefreshToken(refreshToken);

        accessTokens?.forEach((token) => {
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

export const getUserEmail = async (_id: string) => {
    const data = await client.fetch<string>(GET_USER_EMAIL_BY_ID, { _id });
    return data;
};

export const getUserBase32TwoFA = async (_id: string) => {
    const data = await client.fetch<string>(GET_USER_BASE32_2FA_BY_ID, { _id });
    return data;
};

export const getUserTwoFA = async (_id: string) => {
    const data = await client.fetch<string>(GET_USER_2FA_BY_ID, { _id });
    return data;
};

export const getActiveUserTwoFA = async (_id: string) => {
    const data = await client.fetch<{ twoFA: string; active: boolean }>(
        GET_ACTIVE_USER_2FA_BY_ID,
        { _id }
    );
    return data;
};

export const getBase32UserIdByEmail = async (email: string) => {
    const data = await client.fetch<{ base32: string; _id: string }>(
        GET_BASE32_BY_EMAIL,
        { email }
    );
    return data;
};

export const getBase32ById = async (_id: string) => {
    const data = await client.fetch<string>(GET_USER_BASE32_2FA_BY_ID, {
        _id,
    });
    return data;
};

export const getUserIdBase32ById = async (_id: string) => {
    const data = await client.fetch<{ _id: string; base32: string | null }>(
        GET_USER_ID_BASE32_BY_ID,
        { _id }
    );
    return data;
};

export const verifyAccessTokenDb = async (token: string) => {
    const data = await client.fetch(GET_USER_ACCESS_TOKEN, { token });
    return Boolean(data);
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
