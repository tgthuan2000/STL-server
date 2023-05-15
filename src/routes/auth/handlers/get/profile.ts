import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { getUserInfoById } from "~/schema/api/auth";
import { msg } from "~/services";
import { getUserId } from "~/services/auth";

const profile: RequestHandler = async (req, res) => {
    const _id = getUserId(req);

    const data = await getUserInfoById(_id);

    if (data && data.active === false) {
        res.status(STATUS.BAD_REQUEST).json(msg(CODE.INACTIVE_ACCOUNT));
        return;
    }

    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS, data));
};

export default profile;
