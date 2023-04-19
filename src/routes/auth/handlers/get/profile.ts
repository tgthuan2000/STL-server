import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { GET_USER_BY_ID } from "~/schema/query/auth";
import { msg } from "~/services";
import { getUserId } from "~/services/auth";

const profile: RequestHandler = async (req, res) => {
    const _id = getUserId(req);

    const data = await client.fetch(GET_USER_BY_ID, { _id });

    if (data && data.active === false) {
        res.status(STATUS.SUCCESS).json(msg(CODE.INACTIVE_ACCOUNT));
        return;
    }

    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS, data));
};

export default profile;
