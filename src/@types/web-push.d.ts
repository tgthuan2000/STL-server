import webPush from "~/plugin/web-push";

export interface ServiceWebPush {
    addSubscription: ModifySubscription;
    watchNotify: () => void;
    // sendNotification(): void;
}

export type ModifySubscription = (
    userId: string,
    subscription: webPush.PushSubscription
) => Array<webPush.PushSubscription>;

export type CheckSubscription = (
    userId: string,
    subscription: webPush.PushSubscription
) => webPush.PushSubscription;

export type AddSubscription = (
    userId: string,
    subscription: webPush.PushSubscription
) => number;

export interface Subs {
    [x: string]: Array<webPush.PushSubscription>;
}
