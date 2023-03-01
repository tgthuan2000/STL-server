import { RequestHandler } from "express";
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { createToken, deleteToken, saveToken } from "~/services/auth";

const accessToken: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_REFRESH_TOKEN });
        return;
    }

    const handler: VerifyCallback<string | JwtPayload> = async (
        err,
        decoded
    ) => {
        const { _id } = decoded as JwtPayload;
        if (!err) {
            const accessToken = createToken(_id, "1h");
            await saveToken(_id, { accessToken });

            res.status(STATUS.SUCCESS).json({
                code: CODE.SUCCESS,
                accessToken,
            });
            return;
        }
        if (err.message === "jwt expired") {
            await deleteToken(_id, { refreshToken });
            res.status(STATUS.FORBIDDEN).json({
                code: CODE.REFRESH_TOKEN_EXPIRED,
            });
            return;
        }
        // Forbidden
        res.status(STATUS.FORBIDDEN).json({
            code: CODE.FORBIDDEN,
        });
    };

    jwt.verify(
        refreshToken as string,
        process.env.ACCESS_TOKEN_SECRET,
        handler
    );
};

export default accessToken;
