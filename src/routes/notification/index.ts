import express from "express";
import { Controllers } from "~/@types/services";
import { getRouters } from "~/services/controller";
import { control } from "./control";

const router = express.Router();

const controllers: Controllers = {};

getRouters(controllers, router, control);

export default router;
