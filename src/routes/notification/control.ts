import { RequestControl } from "~/@types/services";
import { assign, webPush } from "./handlers/post";

export const control: RequestControl = {
    post: {
        assign: assign,
        "web-push": webPush,
    },
    get: {},
    delete: {},
};
