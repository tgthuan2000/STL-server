import { CODE } from "~/constant/code";

type Message = (
    code: CODE,
    data?: { [x: string]: any }
) => { code: CODE; data: { [x: string]: any } };

export const msg: Message = (code, data) => {
    const result = { code, data };

    if (!data) {
        delete result.data;
    }

    return result;
};
