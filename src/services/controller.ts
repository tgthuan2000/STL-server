import { RequestHandler, Router } from "express";

export interface Controllers {
    [x: string]: string[];
}

export interface Control {
    [key: string]: RequestHandler;
}

export const getRouters = (
    controllers: Controllers,
    router: Router,
    control: Control
) => {
    Object.keys(controllers).forEach((key: "post" | "get" | "delete") => {
        controllers[key].forEach((item) => {
            router[key](`/${item}`, control[item]);
        });
    });
};
