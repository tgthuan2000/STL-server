import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { notify } from "~/services/notify/template";

const assign: RequestHandler = async (req, res) => {
    const { data, url } = req.body;

    if (!data) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_DATA });
        return;
    }

    if (!url) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_URL });
        return;
    }

    await notify(data, url);

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS });
};

export default assign;
