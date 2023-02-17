import { Control } from "~/@types/services";
import {
    changePassword,
    checkEmail,
    profile,
    google,
    signIn,
} from "./handlers";

export const control: Control = {
    "change-password": changePassword,
    "check-email": checkEmail,
    profile: profile,
    "google/sign-in": google.signIn,
    "sign-in": signIn,
};
