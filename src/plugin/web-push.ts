import webPush from "web-push";
import dotenv from "dotenv";

dotenv.config();

webPush.setVapidDetails(
    process.env.WEB_PUSH_SUBJECT,
    process.env.WEB_PUSH_PUBLIC_VAPID_KEY,
    process.env.WEB_PUSH_PRIVATE_VAPID_KEY
);

export default webPush;
