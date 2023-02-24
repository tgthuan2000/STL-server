import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { GET_USER_BY_ID } from "~/schema/query/auth";
import { comparePassword, createToken, getUserTwoFA } from "~/services/auth";

const signIn: RequestHandler = async (req, res) => {
    const { _id, password } = req.body;

    if (!_id) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_ID });
        return;
    }
    if (!password) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_PASSWORD });
        return;
    }

    const isMatch = await comparePassword(_id, password);

    if (!isMatch) {
        res.status(STATUS.SUCCESS).json({ code: CODE.INVALID_PASSWORD });
        return;
    }

    // check 2fa
    const enabled = await getUserTwoFA(_id);

    if (enabled) {
        res.status(STATUS.SUCCESS).json({ code: CODE.CHECK_2FA });
        return;
    }

    const data = await client.fetch(GET_USER_BY_ID, { _id });
    const accessToken = createToken(_id, "1h");
    const refreshToken = createToken(_id, "720h");

    res.status(STATUS.SUCCESS).json({
        code: CODE.SUCCESS,
        accessToken,
        refreshToken,
        data,
    });
};

export default signIn;
