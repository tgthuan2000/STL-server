import express from "express";
import { Controllers } from "~/@types/services";
import { verifyToken } from "~/services/auth";
import { getRouters } from "~/services/controller";
import { control } from "./control";

const router = express.Router();

const controllers: Controllers = {
    post: [
        [verifyToken, "assign"],
        [verifyToken, "web-push"],
    ],
};

getRouters(controllers, router, control);

export default router;
