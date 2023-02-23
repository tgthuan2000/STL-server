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

export const WebPushService = ((): ServiceWebPush => {
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

    const _notify = (subId: string, payload: any) => {
        const sends: Array<Promise<webPush.SendResult>> = [];
        const pushSubscriptions = _subs[subId];
        if (!isEmpty(pushSubscriptions)) {
            pushSubscriptions.forEach((pushSubscription) => {
                sends.push(
                    webPush.sendNotification(
                        pushSubscription,
                        JSON.stringify(payload)
                    )
                );
            });
        }
        if (!isEmpty(sends)) {
            console.log("first");
            Promise.allSettled(sends).then((results) => {
                results.forEach((result) => {
                    if (result.status === "fulfilled") {
                        console.log("Notification sent successfully");
                    } else {
                        console.log("Notification failed");
                    }
                });
            });
        }
    };

    const _watchNotify = () => {
        const sub = client.listen(SUBSCRIPTION_NOTIFY).subscribe((update) => {
            if (update.documentId.includes("drafts")) return;

            const assignNotify = update.result;

            switch (update.transition) {
                case "update": {
                    if (assignNotify) {
                    }
                    break;
                }
                case "appear": {
                    if (assignNotify) {
                        _notify(assignNotify.user._ref, {
                            title: "Thông báo",
                            body: "Alo! Bạn mới có thông báo á!",
                            tag: "notify",
                            url: `/notify/${assignNotify.notify._ref}`,
                        });
                    }
                    break;
                }
            }
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
})();
