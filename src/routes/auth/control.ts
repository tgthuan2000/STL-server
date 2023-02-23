import { Control } from "~/@types/services";
import {
    accessToken,
    changePassword,
    checkEmail,
    google,
    profile,
    setPassword,
    signIn,
} from "./handlers";

export const control: Control = {
    "access-token": accessToken,
    "change-password": changePassword,
    "set-password": setPassword,
    "check-email": checkEmail,
    profile: profile,
    "google/sign-in": google.signIn,
    "sign-in": signIn,
};
