import bcrypt from "bcryptjs";
import express from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { GET_DATA_BY_EMAIL, GET_PASSWORD_BY_ID } from "~/schema/query/auth";

const router = express.Router();

router.post("/check-email", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_EMAIL });
        return;
    }

    const data = await client.fetch<{ password: string }>(GET_DATA_BY_EMAIL, {
        email,
    });

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS, data });
});

router.post("/sign-in", async (req, res) => {
    const { _id, password } = req.body;

    if (!_id) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_ID });
        return;
    }
    if (!password) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_PASSWORD });
        return;
    }

    const data = await client.fetch<{ password: string }>(GET_PASSWORD_BY_ID, {
        _id,
    });

    const isMatch = bcrypt.compareSync(password, data.password);

    if (!isMatch) {
        res.status(STATUS.SUCCESS).json({ code: CODE.INVALID_PASSWORD });
        return;
    }

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS });
});

export default router;
