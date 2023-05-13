import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { auth, notification, schedule } from "~/routes";
import { readAdminConfig } from "./services/admin-config";
import { ScheduleService } from "./services/schedule";
import { WebPushService } from "./services/web-push";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = process.env.ALLOWED_ORIGINS ?? "";

console.log("Allow origins:", allowedOrigins, allowedOrigins.split(","));
app.use(
    cors({
        origin: (origin, callback) => {
            allowedOrigins.includes(origin)
                ? callback(null, true)
                : callback(new Error("Not allowed by CORS"));
        },
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", auth);
app.use("/api/schedule", schedule);
app.use("/api/notification", notification);

app.listen(port, () => {
    readAdminConfig().then((adminConfig) => {
        if (adminConfig.canNotifyBirthday) {
            ScheduleService.watchBirthDay();
        }

        ScheduleService.watchToken();
        WebPushService.watchNotify();
    });

    return console.log(`Server is listening on ${port}`);
});
