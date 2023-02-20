import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { auth, notification, schedule } from "~/routes";
import { readAdminConfig } from "./services/admin-config";
import { scheduleService } from "./services/schedule";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", auth);
app.use("/api/schedule", schedule);
app.use("/api/notification", notification);

app.listen(port, async () => {
    const adminConfig = await readAdminConfig();
    const Schedule = scheduleService();

    if (adminConfig.canNotifyBirthday) {
        await Schedule.birthDayNotification();
    }

    return console.log(`Server is listening on ${port}`);
});
