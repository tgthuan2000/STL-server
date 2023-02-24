import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { getUserId } from "~/services/auth";
import { WebPushService } from "~/services/web-push";

const webPush: RequestHandler = async (req, res) => {
    const { subscription } = req.body;
    const userId = getUserId(req);

    if (!subscription) {
        res.status(STATUS.SUCCESS).json({
            code: CODE.REQUIRED_SUBSCRIPTION_ID,
        });
        return;
    }

    WebPushService.addSubscription(userId, subscription);

    res.status(STATUS.SUCCESS).json({ code: CODE.SUCCESS });
};

export default webPush;
