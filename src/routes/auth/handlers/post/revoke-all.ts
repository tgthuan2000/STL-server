import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from "~/services";
import { _revokeTokenAll, getUserId } from "~/services/auth";

const revokeAll: RequestHandler = async (req, res) => {
    const _id = getUserId(req);

    await _revokeTokenAll(_id);
    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS));
};

export default revokeAll;
