import { RequestControl } from "~/@types/services";
import { assign, webPush } from "./handlers/post";
import { assign as assignPut } from "./handlers/put";

export const control: RequestControl = {
    post: {
        assign: assign,
        "web-push": webPush,
    },
    get: {},
    delete: {},
    put: {
        "assign/:id": assignPut,
    },
};
