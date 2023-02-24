import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { TwoFA } from "~/services/2fa";
import { getUserEmail, getUserId } from "~/services/auth";

// GLOBAL check with postman
const _2FA: RequestHandler = async (req, res) => {
    const id = getUserId(req);

    const userEmail = await getUserEmail(id);

    if (!userEmail) {
        res.status(STATUS.BAD_REQUEST).json({ code: CODE.INVALID_DATA });
        return;
    }

    const secret = TwoFA.generateSecret(userEmail);
    TwoFA.saveUserBase32(id, secret.base32);

    res.status(STATUS.SUCCESS).json({
        code: CODE.SUCCESS,
        otpAuthUrl: secret.otpauth_url,
    });
};
export default _2FA;
