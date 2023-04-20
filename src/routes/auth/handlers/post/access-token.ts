import { RequestHandler } from "express";
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from "~/services";
import {
    createNewAccessToken,
    revokeToken,
    verifyRefreshToken,
} from "~/services/auth";

const accessToken: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_REFRESH_TOKEN));
        return;
    }

    const handler: VerifyCallback<string | JwtPayload> = async (
        err,
        decoded
    ) => {
        const { _id } = decoded as JwtPayload;
        if (!err) {
            // check token in db
            const refreshTokenId = await verifyRefreshToken(_id, refreshToken);

            if (!refreshTokenId) {
                res.status(STATUS.FORBIDDEN).json(msg(CODE.TOKEN_REVOKED));
                return;
            }
            const { accessToken } = await createNewAccessToken(
                _id,
                refreshTokenId
            );

            res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS, { accessToken }));
            return;
        }
        if (err.message === "jwt expired") {
            await revokeToken(refreshToken);
            res.status(STATUS.FORBIDDEN).json(msg(CODE.REFRESH_TOKEN_EXPIRED));
            return;
        }
        // Forbidden
        res.status(STATUS.FORBIDDEN).json(msg(CODE.FORBIDDEN));
    };

    jwt.verify(
        refreshToken as string,
        process.env.ACCESS_TOKEN_SECRET,
        handler
    );
};

export default accessToken;
