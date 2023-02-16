import { RequestHandler } from "express";

export interface Controllers {
    [x: string]: Array<string | Array<string | RequestHandler>>;
}

export interface Control {
    [key: string]: RequestHandler;
}
