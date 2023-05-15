import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { getBase32ById } from "~/schema/api/auth";
import { msg } from "~/services";
import { TwoFA } from "~/services/2fa";
import { getUserId } from "~/services/auth";

const disabled2FA: RequestHandler = async (req, res) => {
    const { code } = req.body;
    const _id = getUserId(req);

    if (!code) {
        res.status(STATUS.BAD_REQUEST).json(msg(CODE.REQUIRED_DATA));
        return;
    }

    let base32: string | null = null;

    if (_id) {
        try {
            base32 = await getBase32ById(_id);
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

    if (!verified) {
        res.status(STATUS.SUCCESS).json(msg(CODE.TWO_FA_INVALID));
        return;
    }

    await client.patch(_id).set({ twoFA: false }).unset(["base32"]).commit();
    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS));
};
export default disabled2FA;
