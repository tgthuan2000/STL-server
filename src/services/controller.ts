import { RequestHandler, Router } from "express";
import { Control, Controllers } from "~/@types/services";

const getControl = (control: Control, item: string | RequestHandler) => {
    return typeof item === "string" ? control[item] : item;
};

export const getRouters = (
    controllers: Controllers,
    router: Router,
    control: Control
) => {
    Object.keys(controllers).forEach((key: "post" | "get" | "delete") => {
        controllers[key].forEach((item) => {
            const { path, handlers } = Array.isArray(item)
                ? {
                      path: item[item.length - 1],
                      handlers: item.map((i) => getControl(control, i)),
                  }
                : { path: item, handlers: [getControl(control, item)] };

            router[key](`/${path}`, ...handlers);
        });
    });
};
