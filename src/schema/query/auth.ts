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

export const GET_USER_ACCESS_TOKEN = groq`
    *[_type == "accessToken" && _id == $token][0]._id
`;

export const GET_USER_REFRESH_TOKEN = groq`
    *[_type == "refreshToken" && user._ref == $_id && token == $token][0]._id
`;

export const GET_USER_TOKEN_BY_ID = groq`
    *[_type == "user" && _id == $_id][0] {
        accessToken,
        refreshToken
    }
`;

export const GET_ACCESS_TOKEN_BY_REFRESH_TOKEN = groq`
    *[_type == "accessToken" && refreshToken._ref == $token] {
        _id,
    }
`;

export const GET_ACCESS_TOKEN = groq`
    *[_type == "accessToken"] {
        _id,
    }
`;

export const GET_REFRESH_TOKEN = groq`
    *[_type == "refreshToken"] {
        _id,
        token
    }
`;
