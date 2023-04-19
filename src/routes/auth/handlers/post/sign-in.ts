import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from "~/services";
import {
    comparePassword,
    createToken,
    getActiveUserTwoFA,
    saveToken,
} from "~/services/auth";

const signIn: RequestHandler = async (req, res) => {
    const { _id, password } = req.body;

    if (!_id) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_ID));
        return;
    }
    if (!password) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_PASSWORD));
        return;
    }

    const isMatch = await comparePassword(_id, password);

    if (!isMatch) {
        res.status(STATUS.SUCCESS).json(msg(CODE.INVALID_PASSWORD));
        return;
    }

    // check 2fa & active
    const { active, twoFA } = await getActiveUserTwoFA(_id);

    if (!active) {
        res.status(STATUS.SUCCESS).json(msg(CODE.INACTIVE_ACCOUNT));
        return;
    }

    if (twoFA) {
        res.status(STATUS.SUCCESS).json(msg(CODE.CHECK_2FA));
        return;
    }

    const accessToken = createToken(_id, "1h");
    const refreshToken = createToken(_id, "720h");

    await saveToken(_id, { accessToken, refreshToken });

    res.status(STATUS.SUCCESS).json(
        msg(CODE.SUCCESS, { accessToken, refreshToken })
    );
};

export default signIn;
