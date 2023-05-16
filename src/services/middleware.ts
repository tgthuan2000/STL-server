import { RequestHandler } from "express";
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from ".";
import { getUserId, getUserToken } from "./auth";
import { verifyAccessTokenDb } from "~/schema/api/auth";

export const verifyToken: RequestHandler = (req, res, next) => {
    const bearerHeader = req.headers.authorization;

    if (!bearerHeader) {
        // Forbidden
        res.status(STATUS.FORBIDDEN).json(msg(CODE.FORBIDDEN));
        return;
    }

    const bearers = bearerHeader.split(" ");
    const bearerToken = bearers[1];

    if (!bearerToken) {
        res.status(STATUS.FORBIDDEN).json(msg(CODE.FORBIDDEN));
        return;
    }
    // verifies secret and checks exp

    const handler: VerifyCallback<string | JwtPayload> = async (
        err,
        decoded
    ) => {
        if (!err) {
            // if everything is good, save to request for use in other routes
            // @ts-ignore
            req.accessToken = decoded;
            // @ts-ignore
            req.token = bearerToken;
            next();
            return;
        }

        if (err.message === "jwt expired") {
            res.status(STATUS.FORBIDDEN).json(msg(CODE.ACCESS_TOKEN_EXPIRED));
            return;
        }
        // Forbidden
        res.status(STATUS.FORBIDDEN).json(msg(CODE.FORBIDDEN));
    };

    jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, handler);
};

export const verifyAccessToken: RequestHandler = async (req, res, next) => {
    const _id = getUserId(req);
    const token = getUserToken(req);

    if (!token || !_id) {
        res.status(STATUS.FORBIDDEN).json(msg(CODE.FORBIDDEN));
        return;
    }

    const verified = await verifyAccessTokenDb(token);

    if (!verified) {
        res.status(STATUS.FORBIDDEN).json(msg(CODE.ACCESS_TOKEN_EXPIRED));
        return;
    }

    next();
};
