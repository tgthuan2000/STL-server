import { RequestHandler } from "express";
import jwtDecode from "jwt-decode";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from "~/services";
import { TwoFA } from "~/services/2fa";
import {
    createAccessRefreshToken,
    getBase32ById,
    getUserAgent,
    getUserIdBase32ById,
} from "~/services/auth";

const _2FA: RequestHandler = async (req, res) => {
    const { _id, code, credential } = req.body;
    const userAgent = getUserAgent(req);
    let base32: string | null = null;
    let id: string | null = null;
    let infoUser: { _id: string; base32: string | null } | undefined =
        undefined;

    if (_id) {
        try {
            base32 = await getBase32ById(_id);
            id = _id;
        } catch (error) {
            console.log(error);
        }
    }
    if (credential) {
        try {
            const decoded = jwtDecode(credential) as any;
            infoUser = await getUserIdBase32ById(decoded.sub); // id google
            if (infoUser) {
                const { _id, base32: _base32 } = infoUser;
                base32 = _base32;
                id = _id;
            }
        } catch (error) {
            console.log(error);
        }
    }

    if (!base32) {
        res.status(STATUS.BAD_REQUEST).json(msg(CODE.INVALID_DATA));
        return;
    }

    //verity code
    const verified = TwoFA.verifyToken(code, base32);

    if (verified) {
        const { accessToken, refreshToken } = await createAccessRefreshToken(
            id,
            { device: userAgent }
        );

        res.status(STATUS.SUCCESS).json(
            msg(CODE.SUCCESS, { accessToken, refreshToken })
        );

        return;
    }

    res.status(STATUS.SUCCESS).json(msg(CODE.TWO_FA_INVALID, { verified }));
};
export default _2FA;
