import { RequestHandler } from "express";
import jwtDecode from "jwt-decode";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from "~/services";
import {
    createAccessRefreshToken,
    getUserAgent,
    getUserTwoFA,
    signInGoogle,
} from "~/services/auth";

const signIn: RequestHandler = async (req, res) => {
    const { credential } = req.body;
    const userAgent = getUserAgent(req);

    if (!credential) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_CREDENTIAL));
        return;
    }

    const data = jwtDecode(credential) as any;

    if (data) {
        const d = await signInGoogle(data);

        // check active
        if (!d.active) {
            res.status(STATUS.SUCCESS).json(msg(CODE.INACTIVE_ACCOUNT));
            return;
        }

        const twoFA = await getUserTwoFA(d._id);

        // check 2fa
        if (twoFA) {
            res.status(STATUS.SUCCESS).json(msg(CODE.CHECK_2FA));
            return;
        }

        const { accessToken, refreshToken } = await createAccessRefreshToken(
            d._id,
            { device: userAgent }
        );

        res.status(STATUS.SUCCESS).json(
            msg(CODE.SUCCESS, { accessToken, refreshToken })
        );
    }
};
export default signIn;
