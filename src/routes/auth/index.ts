import express from "express";
import { Controllers } from "~/@types/services";
import { verifyAccessToken, verifyToken } from "~/services/middleware";
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
        [verifyToken, "revoke-token"],
        [verifyToken, "logout"],
    ],
    get: [
        [verifyToken, verifyAccessToken, "profile"],
        [verifyToken, "2fa"],
    ],
    delete: [],
    put: [],
};

getRouters(controllers, router, control);

export default router;
