import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { GET_USER_BY_ID } from "~/schema/query/auth";
import { getUserId } from "~/services/auth";

const profile: RequestHandler = async (req, res) => {
    const _id = getUserId(req);

    const data = await client.fetch(GET_USER_BY_ID, { _id });

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS, data });
};

export default profile;
