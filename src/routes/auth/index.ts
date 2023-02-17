import express from "express";
import { Controllers } from "~/@types/services";
import { verifyToken } from "~/services/auth";
import { getRouters } from "~/services/controller";
import { control } from "./control";

const router = express.Router();

const controllers: Controllers = {
    post: [
        [verifyToken, "change-password"],
        "check-email",
        "google/sign-in",
        "sign-in",
    ],
    get: [[verifyToken, "profile"]],
};

getRouters(controllers, router, control);

export default router;
