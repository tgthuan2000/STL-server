import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request, RequestHandler } from "express";
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken";
import { get, isEmpty } from "lodash";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import {
    GET_BASE32_BY_EMAIL,
    GET_BASE32_BY_ID,
    GET_PASSWORD_BY_ID,
    GET_USER_2FA_BY_ID,
    GET_USER_ACCESS_TOKEN,
    GET_USER_BASE32_2FA_BY_ID,
    GET_USER_EMAIL_BY_ID,
    GET_USER_ID_BASE32_BY_ID,
    GET_USER_TOKEN_BY_ID,
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
        accessToken?: string;
        refreshToken?: string;
    }
) => {
    try {
        if (!token.accessToken && !token.refreshToken) {
            return;
        }

        const transaction = client.transaction();

        if (token.refreshToken) {
            const patch = client
                .patch(_id)
                .setIfMissing({ refreshToken: [] })
                .append("refreshToken", [token.refreshToken]);
            transaction.patch(patch);
        }
        if (token.accessToken) {
            const patch = client
                .patch(_id)
                .setIfMissing({ accessToken: [] })
                .append("accessToken", [token.accessToken]);
            transaction.patch(patch);
        }
        const response = await transaction.commit();
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const createToken = (_id: string, expiresIn: string | number = "1h") => {
    const token = jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn,
    });
    return token;
};

export const verifyToken: RequestHandler = (req, res, next) => {
    const bearerHeader = req.headers.authorization;

    if (!bearerHeader) {
        // Forbidden
        res.send(STATUS.FORBIDDEN).json({ code: CODE.FORBIDDEN });
        return;
    }

    const bearers = bearerHeader.split(" ");
    const bearerToken = bearers[1];

    if (!bearerToken) {
        res.send(STATUS.FORBIDDEN).json({ code: CODE.FORBIDDEN });
        return;
    }
    // verifies secret and checks exp

    const handler: VerifyCallback<string | JwtPayload> = async (
        err,
        decoded
    ) => {
        if (!err) {
            // if everything is good, save to request for use in other routes
            // @ts-ignore
            req.accessToken = decoded;
            // @ts-ignore
            req.token = bearerToken;
            next();
            return;
        }

        if (err.message === "jwt expired") {
            // delete token in db
            if (decoded) {
                const id = get(decoded, "_id");
                if (id) {
                    await deleteToken(id, { accessToken: bearerToken });
                }
            }

            res.status(STATUS.FORBIDDEN).json({
                code: CODE.ACCESS_TOKEN_EXPIRED,
            });
            return;
        }
        // Forbidden
        res.status(STATUS.FORBIDDEN).json({
            code: CODE.FORBIDDEN,
        });
    };

    jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, handler);
};

export const verifyRevokeToken: RequestHandler = async (req, res, next) => {
    const _id = getUserId(req);
    const token = getUserToken(req);

    if (!token || !_id) {
        res.status(STATUS.FORBIDDEN).json({ code: CODE.FORBIDDEN });
        return;
    }

    const data = await client.fetch(GET_USER_ACCESS_TOKEN, { _id });

    if (isEmpty(data.accessToken)) {
        res.status(STATUS.FORBIDDEN).json({ code: CODE.TOKEN_REVOKED });
        return;
    }

    next();
};

export const deleteToken = async (
    _id: string,
    token: {
        accessToken?: string;
        refreshToken?: string;
    }
) => {
    try {
        const data = await client.fetch(GET_USER_TOKEN_BY_ID, { _id });

        if (!data) {
            return;
        }

        const accessTokenIndex = getTokenIndex(
            data.accessToken,
            token.accessToken
        );
        const refreshTokenIndex = getTokenIndex(
            data.refreshToken,
            token.refreshToken
        );

        if (accessTokenIndex === -1 && refreshTokenIndex === -1) {
            return;
        }

        const transaction = client.transaction();

        if (accessTokenIndex !== -1) {
            const patch = client
                .patch(_id)
                .setIfMissing({ accessToken: [] })
                .splice("accessToken", accessTokenIndex, 1);
            transaction.patch(patch);
        }

        if (refreshTokenIndex !== -1) {
            const patch = client
                .patch(_id)
                .setIfMissing({ refreshToken: [] })
                .splice("refreshToken", refreshTokenIndex, 1);
            transaction.patch(patch);
        }

        const response = await transaction.commit();
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const revokeToken = (_id: string) => {
    try {
        return client
            .patch(_id)
            .setIfMissing({ accessToken: [], refreshToken: [] })
            .unset(["accessToken", "refreshToken"]);
    } catch (error) {
        console.log(error);
    }
};

export const getTokenIndex = (data: any, token: string) => {
    if (!token) {
        return -1;
    }
    const index = data.findIndex((t: string) => t === token);
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

export const getBase32UserIdByEmail = async (email: string) => {
    const data = await client.fetch<{ base32: string; _id: string }>(
        GET_BASE32_BY_EMAIL,
        { email }
    );
    return data;
};

export const getBase32ById = async (_id: string) => {
    const data = await client.fetch<string>(GET_BASE32_BY_ID, {
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
