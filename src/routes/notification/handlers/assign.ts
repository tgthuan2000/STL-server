import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { notificationService } from "~/services/notification";

const service = notificationService();

const assign: RequestHandler = async (req, res) => {
    const { data } = req.body;

    if (!data) {
        res.status(STATUS.SUCCESS).json({ code: CODE.REQUIRED_DATA });
        return;
    }

    await service.setData(data).createNotify().createNotifyAssign().execute();
    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS });
};

export default assign;
