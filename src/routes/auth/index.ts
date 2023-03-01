import express from "express";
import { Controllers } from "~/@types/services";
import { verifyRevokeToken, verifyToken } from "~/services/auth";
import { getRouters } from "~/services/controller";
import { control } from "./control";

const router = express.Router();

const controllers: Controllers = {
    post: [
        "access-token",
        [verifyToken, "change-password"],
        [verifyToken, "set-password"],
        "check-email",
        "google/sign-in",
        "sign-in",
        [verifyToken, "verify-2fa"],
        "2fa",
        [verifyToken, "disabled-2fa"],
        [verifyToken, "logout"],
    ],
    get: [
        [verifyToken, verifyRevokeToken, "profile"],
        [verifyToken, "2fa"],
    ],
    delete: [],
};

getRouters(controllers, router, control);

export default router;
