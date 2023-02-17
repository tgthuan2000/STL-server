import { RequestHandler } from "express";
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { createToken } from "~/services/auth";

const accessToken: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_REFRESH_TOKEN });
        return;
    }

    const handler: VerifyCallback<string | JwtPayload> = (err, decoded) => {
        if (err) {
            if (err.message === "jwt expired") {
                res.status(STATUS.FORBIDDEN).json({
                    code: CODE.REFRESH_TOKEN_EXPIRED,
                });
                return;
            }
            // Forbidden
            res.status(STATUS.FORBIDDEN).json({
                code: CODE.FORBIDDEN,
            });
            return;
        }

        const { _id } = decoded as JwtPayload;

        const accessToken = createToken(_id, "1h");

        res.status(STATUS.SUCCESS).json({
            code: CODE.SUCCESS,
            accessToken,
        });
    };

    jwt.verify(
        refreshToken as string,
        process.env.ACCESS_TOKEN_SECRET,
        handler
    );
};

export default accessToken;
