import express from "express";
import { Controllers } from "~/@types/services";
import { verifyToken } from "~/services/auth";
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
    ],
    get: [
        [verifyToken, "profile"],
        [verifyToken, "2fa"],
    ],
};

getRouters(controllers, router, control);

export default router;
