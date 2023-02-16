import { Control } from "~/@types/services";
import { changePassword, checkEmail, google, signIn } from "./handlers";

export const control: Control = {
    "check-email": checkEmail,
    "google/sign-in": google.signIn,
    "sign-in": signIn,
    "change-password": changePassword,
};