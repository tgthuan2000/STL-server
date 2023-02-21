import { isEmpty } from "lodash";
import {
    AddSubscription,
    CheckSubscription,
    ModifySubscription,
    ServiceWebPush,
    Subs,
} from "~/@types/web-push";
import { client } from "~/plugin/sanity";
import webPush from "~/plugin/web-push";
import { SUBSCRIPTION_NOTIFY } from "~/schema/query/notify";

const webPushService = (): ServiceWebPush => {
    console.log("services/web-push");

    const _subs: Subs = {};

    const _modifySub: ModifySubscription = (userId, sub) => {
        if (!_subs[userId]) {
            _subs[userId] = [];
            _addSub(userId, sub);
        } else {
            const existedSub = _checkSub(userId, sub);
            if (!existedSub) {
                _addSub(userId, sub);
            }
        }
        return _subs[userId];
    };

    const _checkSub: CheckSubscription = (userId, sub) => {
        const existedSub = _subs[userId]?.find(
            (_sub) => JSON.stringify(_sub) === JSON.stringify(sub)
        );
        return existedSub;
    };

    const _addSub: AddSubscription = (userId, subscription) => {
        const index = _subs[userId]?.push(subscription);
        return index;
    };

    const _pushNotify = async (
        subId: string,
        payload?: string | Buffer,
        options?: webPush.RequestOptions
    ) => {
        const sends: Array<Promise<webPush.SendResult>> = [];
        const pushSubscriptions = _subs[subId];
        if (!isEmpty(pushSubscriptions)) {
            pushSubscriptions.forEach((pushSubscription) => {
                sends.push(
                    webPush.sendNotification(pushSubscription, payload, options)
                );
            });
        }
        if (!isEmpty(sends)) {
            return await Promise.allSettled(sends);
        }
    };

    const _watchNotify = () => {
        const sub = client.listen(SUBSCRIPTION_NOTIFY).subscribe((update) => {
            if (update.documentId.includes("drafts")) return;

            const assignNotify = update.result;
            console.log("assignNotify", assignNotify);

            // switch (update.transition) {
            //     case "update": {
            //         if (assignNotify) {
            //         }
            //         break;
            //     }
            //     case "appear": {
            //         if (assignNotify) {
            //             _pushNotify(assignNotify.user._ref);
            //         }
            //         break;
            //     }
            // }
        });
    };

    const services: ServiceWebPush = {
        addSubscription(userId, subscription) {
            const subs = _modifySub(userId, subscription);
            return subs;
        },
        watchNotify() {
            console.log("--- WATCHING NOTIFY");

            _watchNotify();
        },
    };

    return services;
};

export const WebPushService = webPushService();
