import { IRefreshToken } from "~/@types/auth";
import { client } from "~/plugin/sanity";
import {
    GET_ACCESS_TOKEN_BY_REFRESH_TOKEN,
    GET_ACCESS_TOKEN_EXPIRED,
    GET_ACTIVE_USER_2FA_BY_ID,
    GET_ALL_REFRESH_TOKEN_BY_USER_ID,
    GET_BASE32_BY_EMAIL,
    GET_COUNT_USER_BY_EMAIL,
    GET_PASSWORD_BY_ID,
    GET_REFRESH_TOKEN_BY_JWT,
    GET_REFRESH_TOKEN_EXPIRED,
    GET_USER_2FA_BY_ID,
    GET_USER_ACCESS_TOKEN,
    GET_USER_BASE32_2FA_BY_ID,
    GET_USER_BY_EMAIL,
    GET_USER_BY_ID,
    GET_USER_EMAIL_BY_ID,
    GET_USER_ID_BASE32_BY_ID,
    GET_USER_REFRESH_TOKEN,
} from "~/schema/query/auth";

export const validateUserEmail = async (email: string) => {
    return await client.fetch(GET_COUNT_USER_BY_EMAIL, { email });
};

export const getUserInfoById = async (_id: string) => {
    return await client.fetch(GET_USER_BY_ID, { _id });
};
export const getUserInfoByEmail = async (email: string) => {
    return await client.fetch(GET_USER_BY_EMAIL, { email });
};

export const getPasswordByUserId = async (_id: string) => {
    return await client.fetch<{ password: string }>(GET_PASSWORD_BY_ID, {
        _id,
    });
};

export const verifyRefreshToken = async (_id: string, token: string) => {
    const data = await client.fetch<string>(GET_USER_REFRESH_TOKEN, {
        _id,
        token,
    });
    return data;
};

export const getAccessByRefreshToken = async (refreshToken: string) => {
    const data = await client.fetch<Array<{ _id: string }>>(
        GET_ACCESS_TOKEN_BY_REFRESH_TOKEN,
        { token: refreshToken }
    );
    return data;
};

export const getAllRefreshTokenByUserId = async (userId: string) => {
    const data = await client.fetch<Array<IRefreshToken>>(
        GET_ALL_REFRESH_TOKEN_BY_USER_ID,
        { userId: userId }
    );
    return data;
};

export const getRefreshTokenByJwt = async (refreshTokenJwt: string) => {
    const data = await client.fetch<IRefreshToken>(GET_REFRESH_TOKEN_BY_JWT, {
        jwt: refreshTokenJwt,
    });
    return data;
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

export const getAccessTokenExpired = async () => {
    return await client.fetch<Array<{ _id: string }>>(GET_ACCESS_TOKEN_EXPIRED);
};

export const getRefreshTokenExpired = async () => {
    return await client.fetch<Array<IRefreshToken>>(GET_REFRESH_TOKEN_EXPIRED);
};
