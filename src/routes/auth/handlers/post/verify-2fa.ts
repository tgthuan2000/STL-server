import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { TwoFA } from "~/services/2fa";
import { getUserId, revokeToken } from "~/services/auth";

// GLOBAL check with postman
const verify2FA: RequestHandler = async (req, res) => {
    const { code } = req.body;
    const id = getUserId(req);

    if (!code) {
        res.status(STATUS.BAD_REQUEST).json({ code: CODE.REQUIRED_DATA });
        return;
    }

    const base32 = TwoFA.getUserBase32(id);

    if (!base32) {
        res.status(STATUS.BAD_REQUEST).json({ code: CODE.INVALID_DATA });
        return;
    }

    const verified = TwoFA.verifyToken("" + code, base32);

    if (verified) {
        try {
            const transaction = client.transaction();
            transaction.patch(TwoFA.saveSanity(id, base32));
            transaction.patch(revokeToken(id));
            await transaction.commit();

            const backupCodes = TwoFA.generateBackupCodes(base32);
            res.status(STATUS.SUCCESS).json({
                code: CODE.SUCCESS,
                verified,
                backupCodes,
            });
        } catch (error) {
            console.log(error);
        }
        return;
    }

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS, verified });
};
export default verify2FA;
