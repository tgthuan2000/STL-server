import express from "express";
import { Controllers, getRouters } from "~/services/controller";
import { control } from "./control";

const router = express.Router();

const controllers: Controllers = {
    post: ["check-email", "google/sign-in", "sign-in", "change-password"],
    get: [],
    delete: [],
};

getRouters(controllers, router, control);

export default router;
