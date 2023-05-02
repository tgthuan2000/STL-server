import bcrypt from "bcryptjs";
import { RequestHandler } from "express";
import { isUndefined } from "lodash";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { msg } from "~/services";

const register: RequestHandler = async (req, res) => {
    const { active, email, password, userName, role } = req.body;

    if (!password || !userName || !email || !role || isUndefined(active)) {
        res.status(STATUS.SUCCESS).json(msg(CODE.INVALID_DATA));
        return;
    }

    // check email exist
    const users = await client.fetch(
        'count(*[_type == "user" && email == $email])',
        { email }
    );

    if (users > 0) {
        res.status(STATUS.SUCCESS).json(msg(CODE.EMAIL_EXIST));
        return;
    }

    // hash password
    const hashPassword = bcrypt.hashSync(password);

    // create user
    // await client.create({
    //     _type: "user",
    //     email,
    //     userName,
    //     password: hashPassword,
    //     role: { _type: "reference", _ref: role },
    //     active,
    // });

    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS));
};

export default register;
