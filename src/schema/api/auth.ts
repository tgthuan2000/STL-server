import moment from "moment";
import { IRefreshToken } from "~/@types/auth";
import { IUserBirthDay } from "~/@types/schedule";
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
    GET_USERS_BIRTHDAY,
    GET_USER_2FA_BY_ID,
    GET_USER_ACCESS_TOKEN,
    GET_USER_BASE32_2FA_BY_ID,
    GET_USER_BY_EMAIL,
    GET_USER_BY_ID,
    GET_USER_EMAIL_BY_ID,
    GET_USER_ID_BASE32_BY_ID,
    GET_USER_REFRESH_TOKEN,
} from "~/schema/query/auth";

export const validateUserEmail = (email: string) => {
    return client.fetch(GET_COUNT_USER_BY_EMAIL, { email });
};

export const getUserInfoById = (_id: string) => {
    return client.fetch(GET_USER_BY_ID, { _id });
};
export const getUserInfoByEmail = (email: string) => {
    return client.fetch(GET_USER_BY_EMAIL, { email });
};

export const getPasswordByUserId = (_id: string) => {
    return client.fetch<{ password: string }>(GET_PASSWORD_BY_ID, {
        _id,
    });
};

export const verifyRefreshToken = (_id: string, token: string) => {
    const data = client.fetch<string>(GET_USER_REFRESH_TOKEN, {
        _id,
        token,
    });
    return data;
};

export const getAccessByRefreshToken = (refreshToken: string) => {
    const data = client.fetch<Array<{ _id: string }>>(
        GET_ACCESS_TOKEN_BY_REFRESH_TOKEN,
        { token: refreshToken }
    );
    return data;
};

export const getAllRefreshTokenByUserId = (userId: string) => {
    const data = client.fetch<Array<IRefreshToken>>(
        GET_ALL_REFRESH_TOKEN_BY_USER_ID,
        { userId: userId }
    );
    return data;
};

export const getRefreshTokenByJwt = (refreshTokenJwt: string) => {
    const data = client.fetch<IRefreshToken>(GET_REFRESH_TOKEN_BY_JWT, {
        jwt: refreshTokenJwt,
    });
    return data;
};

export const getUserEmail = (_id: string) => {
    const data = client.fetch<string>(GET_USER_EMAIL_BY_ID, { _id });
    return data;
};

export const getUserBase32TwoFA = (_id: string) => {
    const data = client.fetch<string>(GET_USER_BASE32_2FA_BY_ID, { _id });
    return data;
};

export const getUserTwoFA = (_id: string) => {
    const data = client.fetch<string>(GET_USER_2FA_BY_ID, { _id });
    return data;
};

export const getActiveUserTwoFA = (_id: string) => {
    const data = client.fetch<{ twoFA: string; active: boolean }>(
        GET_ACTIVE_USER_2FA_BY_ID,
        { _id }
    );
    return data;
};

export const getBase32UserIdByEmail = (email: string) => {
    const data = client.fetch<{ base32: string; _id: string }>(
        GET_BASE32_BY_EMAIL,
        { email }
    );
    return data;
};

export const getBase32ById = (_id: string) => {
    const data = client.fetch<string>(GET_USER_BASE32_2FA_BY_ID, {
        _id,
    });
    return data;
};

export const getUserIdBase32ById = (_id: string) => {
    const data = client.fetch<{ _id: string; base32: string | null }>(
        GET_USER_ID_BASE32_BY_ID,
        { _id }
    );
    return data;
};

export const verifyAccessTokenDb = async (token: string) => {
    const data = await client.fetch(GET_USER_ACCESS_TOKEN, { token });
    return Boolean(data);
};

export const getAccessTokenExpired = () => {
    return client.fetch<Array<{ _id: string }>>(GET_ACCESS_TOKEN_EXPIRED);
};

export const getRefreshTokenExpired = () => {
    return client.fetch<Array<IRefreshToken>>(GET_REFRESH_TOKEN_EXPIRED);
};

export const getUserBirthday = () => {
    return client.fetch<IUserBirthDay[]>(GET_USERS_BIRTHDAY, {
        birthDay: moment().add(1, "days").format("*MM-DD"),
    });
};
