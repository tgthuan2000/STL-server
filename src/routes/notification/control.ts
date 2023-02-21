import { Control } from "~/@types/services";
import { assign, webPush } from "./handlers";

export const control: Control = {
    assign: assign,
    "web-push": webPush,
};
