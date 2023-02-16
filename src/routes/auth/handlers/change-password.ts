import bcrypt from "bcryptjs";
import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { comparePassword, getUserId } from "~/services/auth";

const changePassword: RequestHandler = async (req, res) => {
    const { newPassword, oldPassword } = req.body;
    const _id = getUserId(req);

    if (!newPassword || !oldPassword) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_PASSWORD });
        return;
    }

    const isMatch = await comparePassword(_id, oldPassword);

    if (!isMatch) {
        res.status(STATUS.SUCCESS).json({ code: CODE.INVALID_PASSWORD });
        return;
    }

    const transaction = client.transaction();

    transaction.patch(_id, { set: { password: bcrypt.hashSync(newPassword) } });

    await transaction.commit();

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS });
};

export default changePassword;
