import groq from "groq";

export const GET_USER_BY_EMAIL = groq`
    *[_type == "user" && email == $email] {
        _id,
        _createdAt,
        userName,
        email,
        image,
        google,
        "isHasPassword": defined(password),
        allowSendMail,
    }
`;

export const GET_USER_BY_ID = groq`
    *[_type == "user" && _id == $_id][0] {
        _id,
        _createdAt,
        userName,
        email,
        image,
        google,
        "isHasPassword": defined(password),
        allowSendMail,
    }
`;

export const GET_PASSWORD_BY_ID = groq`
    *[_type == "user" && _id == $_id][0] {
        password,
    }
`;

export const GET_USERS_ID = groq`
    *[_type == "user"]{
        _id,
        userName,
        email,
        allowSendMail,
        "sendMail": allowSendMail,
    }
`;
