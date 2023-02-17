import { RequestHandler } from "express";
import jwtDecode from "jwt-decode";
import { CODE } from "~/constant/code";
import { ROLE } from "~/constant/role";
import { STATUS } from "~/constant/status";
import { client } from "~/plugin/sanity";
import { GET_USER_BY_ID } from "~/schema/query/auth";
import { createAccessToken } from "~/services/auth";

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
        const _data = await client.fetch(GET_USER_BY_ID, { _id: d._id });
        const accessToken = createAccessToken(d._id);

        res.status(STATUS.SUCCESS).json({
            code: CODE.SUCCESS,
            data: _data,
            accessToken,
        });
    }
};
export default signIn;
