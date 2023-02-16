import express from "express";
import { Controllers } from "~/@types/services";
import { verifyToken } from "~/services/auth";
import { getRouters } from "~/services/controller";
import { control } from "./control";

const router = express.Router();

const controllers: Controllers = {
    post: [
        "check-email",
        "google/sign-in",
        "sign-in",
        [verifyToken, "change-password"],
    ],
};

getRouters(controllers, router, control);

export default router;
