import { RequestHandler, Router } from "express";
import { Controllers, RequestControl, RequestKey } from "~/@types/services";

const getControl = (
    control: RequestControl,
    key: RequestKey,
    item: string | RequestHandler
) => {
    return typeof item === "string" ? control[key][item] : item;
};

export const getRouters = (
    controllers: Controllers,
    router: Router,
    control: RequestControl
) => {
    Object.keys(controllers).forEach((key: RequestKey) => {
        controllers[key].forEach((item) => {
            const { path, handlers } = Array.isArray(item)
                ? {
                      path: item.at(-1),
                      handlers: item.map((i) => getControl(control, key, i)),
                  }
                : { path: item, handlers: [getControl(control, key, item)] };

            router[key](`/${path}`, ...handlers);
        });
    });
};
