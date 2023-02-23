import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request, RequestHandler } from "express";
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken";
import { get } from "lodash";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { GET_PASSWORD_BY_ID, GET_USER_EMAIL_BY_ID } from "~/schema/query/auth";

dotenv.config();

export const comparePassword = async (_id: string, password: string) => {
    const data = await client.fetch<{ password: string }>(GET_PASSWORD_BY_ID, {
        _id,
    });
    const isMatch = bcrypt.compareSync(password, data.password);
    return isMatch;
};

export const createToken = (_id: string, expiresIn: string | number = "1h") => {
    const token = jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn,
    });
    return token;
};

export const verifyToken: RequestHandler = (req, res, next) => {
    const bearerHeader = req.headers.authorization;

    if (bearerHeader) {
        const bearers = bearerHeader.split(" ");
        const bearerToken = bearers[1];

        if (bearerToken) {
            // verifies secret and checks exp

            const handler: VerifyCallback<string | JwtPayload> = (
                err,
                decoded
            ) => {
                if (err) {
                    if (err.message === "jwt expired") {
                        res.status(STATUS.FORBIDDEN).json({
                            code: CODE.ACCESS_TOKEN_EXPIRED,
                        });
                        return;
                    }
                    // Forbidden
                    res.status(STATUS.FORBIDDEN).json({
                        code: CODE.FORBIDDEN,
                    });
                    return;
                }

                // if everything is good, save to request for use in other routes
                // @ts-ignore
                req.accessToken = decoded;
                next();
            };

            jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, handler);
        }
    } else {
        // Forbidden
        res.send(STATUS.FORBIDDEN).json({ code: CODE.FORBIDDEN });
    }
};

export const getUserId = (req: Request) => {
    // @ts-ignore
    return get(req, "accessToken._id", null);
};

export const getUserEmail = async (_id: string) => {
    const data = await client.fetch(GET_USER_EMAIL_BY_ID, { _id });
    return data;
};
