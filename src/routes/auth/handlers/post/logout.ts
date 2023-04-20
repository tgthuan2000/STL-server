import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from "~/services";
import { deleteToken } from "~/services/auth";

const logout: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_REFRESH_TOKEN));
        return;
    }

    await deleteToken(refreshToken);
    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS));
};

export default logout;
