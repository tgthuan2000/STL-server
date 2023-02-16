import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { get } from "lodash";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { GET_PASSWORD_BY_ID } from "~/schema/query/auth";

dotenv.config();

export const comparePassword = async (_id: string, password: string) => {
    const data = await client.fetch<{ password: string }>(GET_PASSWORD_BY_ID, {
        _id,
    });
    const isMatch = bcrypt.compareSync(password, data.password);
    return isMatch;
};

export const createAccessToken = (_id: string) => {
    const token = jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "60m",
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
            jwt.verify(
                bearerToken,
                process.env.ACCESS_TOKEN_SECRET,
                (err, decoded) => {
                    if (err) {
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
                }
            );
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
