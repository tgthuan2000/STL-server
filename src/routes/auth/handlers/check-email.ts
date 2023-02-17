import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { GET_USER_BY_EMAIL } from "~/schema/query/auth";

// GLOBAL check with postman
const checkEmail: RequestHandler = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_EMAIL });
        return;
    }

    const data = await client.fetch<{ password: string }>(GET_USER_BY_EMAIL, {
        email,
    });

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS, data });
};
export default checkEmail;
