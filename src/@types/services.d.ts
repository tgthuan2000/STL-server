import { RequestHandler } from "express";

export type Controllers = Record<
    RequestKey,
    Array<string | Array<string | RequestHandler>>
>;

export type RequestKey = "post" | "get" | "delete";
export interface Control {
    [key: string]: RequestHandler;
}

export type RequestControl = Record<
    RequestKey,
    { [key: string]: RequestHandler }
>;
