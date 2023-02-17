import { Control } from "~/@types/services";
import {
    accessToken,
    changePassword,
    checkEmail,
    google,
    profile,
    signIn,
} from "./handlers";

export const control: Control = {
    "access-token": accessToken,
    "change-password": changePassword,
    "check-email": checkEmail,
    profile: profile,
    "google/sign-in": google.signIn,
    "sign-in": signIn,
};
