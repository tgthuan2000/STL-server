import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from "~/services";
import { revokeToken as _revokeToken } from "~/services/auth";

const revokeToken: RequestHandler = async (req, res) => {
    const { tokenId } = req.body;

    if (!tokenId) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_REFRESH_TOKEN));
        return;
    }

    await _revokeToken(tokenId);
    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS));
};

export default revokeToken;
