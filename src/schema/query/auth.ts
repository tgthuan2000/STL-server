import groq from "groq";

export const GET_USER_BY_EMAIL = groq`
    *[_type == "user" && email == $email] {
        _id,
        _createdAt,
        userName,
        email,
        birthDay,
        image,
        google,
        "isHasPassword": defined(password),
        allowSendMail,
        twoFA
    }
`;

export const GET_USER_ID_BASE32_BY_ID = groq`
    *[_type == "user" && _id == $_id][0] {
        _id,
        base32
    }
`;

export const GET_USER_BY_ID = groq`
    *[_type == "user" && _id == $_id][0] {
        _id,
        _createdAt,
        userName,
        email,
        image,
        birthDay,
        google,
        "isHasPassword": defined(password),
        allowSendMail,
        twoFA,
        active
    }
`;

export const GET_USER_EMAIL_BY_ID = groq`
    *[_type == "user" && _id == $_id][0].email
`;

export const GET_USER_BASE32_2FA_BY_ID = groq`
    *[_type == "user" && _id == $_id][0].base32
`;

export const GET_USER_2FA_BY_ID = groq`
    *[_type == "user" && _id == $_id][0].twoFA
`;

export const GET_ACTIVE_USER_2FA_BY_ID = groq`
    *[_type == "user" && _id == $_id][0]{
        twoFA,
        active
    }
`;

export const GET_BASE32_BY_EMAIL = groq`
    *[_type == "user" && email == $email][0] {
        _id,
        base32
    }
`;

export const GET_PASSWORD_BY_ID = groq`
    *[_type == "user" && _id == $_id][0] {
        password,
    }
`;

export const GET_USERS = groq`
    *[_type == "user"] {
        _id,
        userName,
        email,
        birthDay,
        allowSendMail,
        "sendMail": allowSendMail,
    }
`;

export const GET_USERS_BIRTHDAY = groq`
    *[_type == "user" && defined(birthDay)] {
        _id,
        userName,
        email,
        birthDay,
        allowSendMail,
        "sendMail": allowSendMail,
    }
`;

const EXPIRED_TIME = "dateTime(now()) > dateTime(expiredAt)";
const NON_EXPIRED_TIME = "dateTime(now()) <= dateTime(expiredAt)";
const ACCESS_TOKEN_IDS = `"accessTokens": *[_type == "accessToken" && refreshToken._ref == ^._id] { _id }`;

export const GET_USER_ACCESS_TOKEN = groq`
    *[_type == "accessToken" && token == $token && ${NON_EXPIRED_TIME}][0]._id
`;

export const GET_USER_REFRESH_TOKEN = groq`
    *[_type == "refreshToken" && user._ref == $_id && token == $token][0]._id
`;

export const GET_ACCESS_TOKEN_BY_REFRESH_TOKEN = groq`
    *[_type == "accessToken" && refreshToken._ref == $token && ${NON_EXPIRED_TIME}] {
        _id,
    }
`;

export const GET_REFRESH_TOKEN_BY_JWT = groq`
    *[_type == "refreshToken" && token == $jwt][0] {
        _id,
        ${ACCESS_TOKEN_IDS}
    }
`;

export const GET_ACCESS_TOKEN_EXPIRED = groq`
    *[_type == "accessToken" && ${EXPIRED_TIME}] {
        _id,
    }
`;

export const GET_REFRESH_TOKEN = groq`
    *[_type == "refreshToken" && ${NON_EXPIRED_TIME}] {
        _id,
        ${ACCESS_TOKEN_IDS}
    }
`;

export const GET_REFRESH_TOKEN_EXPIRED = groq`
    *[_type == "refreshToken" && ${EXPIRED_TIME}] {
        _id,
        ${ACCESS_TOKEN_IDS}
    }
`;

export const GET_ALL_REFRESH_TOKEN_BY_USER_ID = groq`
    *[_type == "refreshToken" && user._ref == $userId] {
        _id,
        ${ACCESS_TOKEN_IDS}
    }
`;
