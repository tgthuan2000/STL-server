import bcrypt from "bcryptjs";
import express from "express";
import { client } from "~/plugin/sanity";
import { GET_PASSWORD_BY_ID, GET_DATA_BY_EMAIL } from "~/schema/query/auth";

const router = express.Router();

router.post("/check-email", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: "email is required" });
        return;
    }

    const data = await client.fetch<{ password: string }>(GET_DATA_BY_EMAIL, {
        email,
    });

    res.status(200).send(data);
});

router.post("/sign-in", async (req, res) => {
    const { _id, password } = req.body;

    if (!_id) {
        res.status(400).json({ message: "_id is required" });
        return;
    }
    if (!password) {
        res.status(400).json({ message: "password is required" });
        return;
    }

    const data = await client.fetch<{ password: string }>(GET_PASSWORD_BY_ID, {
        _id,
    });

    const isMatch = bcrypt.compareSync(password, data.password);

    if (!isMatch) {
        res.status(400).json({ message: "password is incorrect" });
        return;
    }

    res.status(200).json({ message: "success" });
});

export default router;
