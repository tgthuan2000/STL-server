import { RequestControl } from "~/@types/services";
import { longBudget } from "./handlers/delete";

export const control: RequestControl = {
    post: {},
    get: {},
    delete: {
        "long-budget": longBudget,
    },
    put: {},
};
