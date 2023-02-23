import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { TwoFA } from "~/services/2fa";
import { getUserId } from "~/services/auth";

// GLOBAL check with postman
const _2FA: RequestHandler = async (req, res) => {
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
        const log = await TwoFA.saveSanity(id, base32);
        console.log(log);
        const backupCodes = TwoFA.generateBackupCodes(base32);
        res.status(STATUS.SUCCESS).json({
            code: CODE.SUCCESS,
            verified,
            backupCodes,
        });
        return;
    }

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS, verified });
};
export default _2FA;
