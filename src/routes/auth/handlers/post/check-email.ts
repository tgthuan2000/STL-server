import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { getUserInfoByEmail } from "~/schema/api/auth";
import { msg } from "~/services";

// GLOBAL check with postman
const checkEmail: RequestHandler = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_EMAIL));
        return;
    }

    const data = await getUserInfoByEmail(email);

    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS, data));
};
export default checkEmail;
