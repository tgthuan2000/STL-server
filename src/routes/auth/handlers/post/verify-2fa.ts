import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { getAllRefreshTokenByUserId } from "~/schema/api/auth";
import { msg } from "~/services";
import { TwoFA } from "~/services/2fa";
import { getUserId } from "~/services/auth";

// GLOBAL check with postman
const verify2FA: RequestHandler = async (req, res) => {
    const { code } = req.body;
    const id = getUserId(req);

    if (!code) {
        res.status(STATUS.BAD_REQUEST).json(msg(CODE.REQUIRED_DATA));
        return;
    }

    const base32 = TwoFA.getUserBase32(id);

    if (!base32) {
        res.status(STATUS.BAD_REQUEST).json(msg(CODE.INVALID_DATA));
        return;
    }

    const verified = TwoFA.verifyToken("" + code, base32);

    if (verified) {
        try {
            const transaction = client.transaction();
            transaction.patch(TwoFA.saveSanity(id, base32));

            // revoke all refresh tokens
            const refreshTokens = await getAllRefreshTokenByUserId(id);

            refreshTokens.forEach((refreshToken) => {
                transaction.delete(refreshToken._id);
                refreshToken.accessTokens.forEach((token) => {
                    transaction.delete(token._id);
                });
            });

            await transaction.commit();

            const backupCodes = TwoFA.generateBackupCodes(base32);

            res.status(STATUS.SUCCESS).json(
                msg(CODE.SUCCESS, { verified, backupCodes })
            );
        } catch (error) {
            console.log(error);
        }
        return;
    }

    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS, { verified }));
};
export default verify2FA;
