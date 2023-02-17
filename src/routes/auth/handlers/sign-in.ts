import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { comparePassword, createAccessToken } from "~/services/auth";

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

    const accessToken = createAccessToken(_id);

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS, accessToken });
};

export default signIn;
