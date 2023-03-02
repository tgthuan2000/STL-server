import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { deleteToken, getUserId, getUserToken } from "~/services/auth";

const logout: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;
    const _id = getUserId(req);
    const accessToken = getUserToken(req);

    if (!refreshToken) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_REFRESH_TOKEN });
        return;
    }

    if (!_id || !accessToken) {
        res.status(STATUS.FORBIDDEN).json({ code: CODE.FORBIDDEN });
        return;
    }

    await deleteToken(_id, { accessToken, refreshToken });
    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS });
};

export default logout;