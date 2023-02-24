import { RequestHandler } from "express";
import jwtDecode from "jwt-decode";
import { CODE } from "~/constant/code";
import { ROLE } from "~/constant/role";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { createToken, getUserTwoFA } from "~/services/auth";

const signIn: RequestHandler = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_CREDENTIAL });
        return;
    }

    const data = jwtDecode(credential) as any;

    if (data) {
        const { sub, picture, name, email } = data;
        const document = {
            _type: "user",
            _id: sub,
            image: picture,
            userName: name,
            email,
            google: JSON.stringify(data),
            allowSendMail: true,
            role: {
                _type: "reference",
                _ref: ROLE.CLIENT,
            },
        };

        const d = await client.createIfNotExists(document);
        const twoFA = await getUserTwoFA(d._id);

        // check 2fa
        if (twoFA) {
            res.status(STATUS.SUCCESS).json({ code: CODE.CHECK_2FA });
            return;
        }

        const accessToken = createToken(d._id, "1h");
        const refreshToken = createToken(d._id, "720h");

        res.status(STATUS.SUCCESS).json({
            code: CODE.SUCCESS,
            accessToken,
            refreshToken,
        });
    }
};
export default signIn;
