import { RequestHandler } from "express";
import { CODE } from "~/constant/code";
import { STATUS } from "~/constant/status";
import { msg } from "~/services";
import { Spending } from "~/services/spending";

// GLOBAL check with postman
const longBudget: RequestHandler = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(STATUS.SUCCESS).json(msg(CODE.REQUIRED_ID));
        return;
    }

    try {
        await Spending.delete.longBudget(id);
        res.status(STATUS.SUCCESS).json(msg(CODE.SUCCESS));
    } catch (error) {
        res.status(STATUS.SUCCESS).json(msg(CODE.FORBIDDEN));
    }
};

export default longBudget;
