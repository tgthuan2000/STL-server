import { RequestHandler } from "express";
import jwtDecode from "jwt-decode";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { GET_USER_BY_ID } from "~/schema/query/auth";
import { TwoFA } from "~/services/2fa";
import {
    createToken,
    getBase32ById,
    getUserIdBase32ByEmail,
} from "~/services/auth";

const _2FA: RequestHandler = async (req, res) => {
    const { _id, code, credential } = req.body;

    if (!code) {
        res.status(STATUS.BAD_REQUEST).json({ code: CODE.REQUIRED_DATA });
        return;
    }

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
            infoUser = await getUserIdBase32ByEmail(decoded.email);
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
        res.status(STATUS.BAD_REQUEST).json({ code: CODE.INVALID_DATA });
        return;
    }

    //verity code
    const verified = TwoFA.verifyToken(code, base32);

    if (verified) {
        const accessToken = createToken(id, "1h");
        const refreshToken = createToken(id, "720h");

        const data = await client.fetch(GET_USER_BY_ID, { _id: id });
        res.status(STATUS.SUCCESS).json({
            code: CODE.SUCCESS,
            accessToken,
            refreshToken,
            data,
        });

        return;
    }

    res.status(STATUS.SUCCESS).json({ code: CODE.TWO_FA_INVALID, verified });
};
export default _2FA;