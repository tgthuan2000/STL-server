import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { auth, notification, schedule, spending } from "~/routes";
import { readAdminConfig } from "./services/admin-config";
import { ScheduleService } from "./services/schedule";
import { WebPushService } from "./services/web-push";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(
    cors({
        origin: "*",
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", auth);
app.use("/api/schedule", schedule);
app.use("/api/notification", notification);
app.use("/api/spending", spending);

app.listen(port, () => {
    readAdminConfig().then((adminConfig) => {
        if (adminConfig.canNotifyBirthday) {
            ScheduleService.watchBirthDay();
        }
        if (adminConfig.canNotifyScheduleOfUsers) {
            ScheduleService.watchScheduleOfUsers();
        }

        ScheduleService.watchToken();
        WebPushService.watchNotify();
    });

    return console.log(`Server is listening on ${port}`);
});
