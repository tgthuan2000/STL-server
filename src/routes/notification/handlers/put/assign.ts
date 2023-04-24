import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from "~/services";
import { notify } from "~/services/notify/template";

const assign: RequestHandler = async (req, res) => {
    const { data, url } = req.body;
    const { id } = req.params;

    if (!id) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_ID));
        return;
    }

    if (!data) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_DATA));
        return;
    }

    if (!url) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_URL));
        return;
    }

    await notify.put(id, data, url);

    res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS));
};

export default assign;
