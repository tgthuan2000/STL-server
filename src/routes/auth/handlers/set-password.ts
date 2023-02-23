import bcrypt from "bcryptjs";
import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { getUserId } from "~/services/auth";

const setPassword: RequestHandler = async (req, res) => {
    const { password } = req.body;
    const _id = getUserId(req);

    if (!password) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_PASSWORD });
        return;
    }

    const transaction = client.transaction();

    transaction.patch(_id, { set: { password: bcrypt.hashSync(password) } });

    await transaction.commit();

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS });
};

export default setPassword;
