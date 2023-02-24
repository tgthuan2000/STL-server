import { RequestControl } from "~/@types/services";
import { profile, _2FA } from "./handlers/get";
import {
    accessToken,
    changePassword,
    checkEmail,
    disabled2FA,
    google,
    setPassword,
    signIn,
    verify2FA,
    _2FA as post_2FA,
} from "./handlers/post";

export const control: RequestControl = {
    post: {
        "access-token": accessToken,
        "change-password": changePassword,
        "set-password": setPassword,
        "check-email": checkEmail,
        "google/sign-in": google.signIn,
        "verify-2fa": verify2FA,
        "sign-in": signIn,
        "2fa": post_2FA,
        "disabled-2fa": disabled2FA,
    },
    get: {
        profile: profile,
        "2fa": _2FA,
    },
    delete: {},
};
