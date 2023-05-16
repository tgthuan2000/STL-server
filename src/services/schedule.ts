import { isEmpty } from "lodash";
import schedule from "node-schedule";
import { client } from "~/plugin/sanity";
import {
    getAccessTokenExpired,
    getRefreshTokenExpired,
    getUserBirthday,
} from "~/schema/api/auth";
import { getScheduleJobOfUsers } from "~/schema/api/schedule";
import { notifySchedule, notifyScheduleJob } from "./notify/template";

export const ScheduleService = (() => {
    console.log("services/schedule");

    const _log = (result: PromiseSettledResult<void>) => {
        console.log({
            status: result.status,
            time: new Date().toLocaleString(),
        });
    };

    const _scheduleBirthdayUser = () => {
        schedule.scheduleJob("0 23 * * *", async () => {
            console.log("--- CHECK BIRTHDAY OF USERS", new Date());
            const users = await getUserBirthday();

            if (!isEmpty(users)) {
                console.log(
                    "Users have birthday:",
                    users.map((user) => user.userName).join(", ")
                );
                const promises: Promise<void>[] = [];
                users.forEach((user) => {
                    promises.push(notifySchedule(user));
                });

                Promise.allSettled(promises).then((results) => {
                    results.forEach((result) => _log(result));
                });
            }
        });
    };

    const _scheduleJobOfUser = () => {
        schedule.scheduleJob("0 0 * * *", async () => {
            console.log("--- CHECK SCHEDULE JOB OF USERS", new Date());
            const scheduleJobs = await getScheduleJobOfUsers();

            if (!isEmpty(scheduleJobs)) {
                console.log(
                    "Schedule job of users:",
                    scheduleJobs
                        .map((scheduleJob) => scheduleJob.title)
                        .join(", ")
                );

                const promises: Promise<void>[] = [];
                scheduleJobs.forEach((scheduleJob) => {
                    promises.push(notifyScheduleJob(scheduleJob));
                });

                Promise.allSettled(promises).then((results) => {
                    results.forEach((result) => _log(result));
                });
            }
        });
    };

    const _scheduleAccessToken = () => {
        schedule.scheduleJob("0 0 * * *", async () => {
            console.log("--- CHECK ACCESS TOKEN", new Date());

            const accessTokens = await getAccessTokenExpired();

            if (!isEmpty(accessTokens)) {
                const transaction = client.transaction();
                for (const token of accessTokens) {
                    transaction.delete(token._id);
                }
                await transaction.commit();
            }
        });
    };

    const _scheduleRefreshToken = () => {
        schedule.scheduleJob("0 0 15 * *", async () => {
            console.log("--- CHECK REFRESH TOKEN", new Date());

            const refreshTokens = await getRefreshTokenExpired();

            if (!isEmpty(refreshTokens)) {
                const transaction = client.transaction();
                for (const token of refreshTokens) {
                    transaction.delete(token._id);
                    for (const accessToken of token.accessTokens) {
                        transaction.delete(accessToken._id);
                    }
                }
                await transaction.commit();
            }
        });
    };

    return {
        watchScheduleOfUsers() {
            console.log("--- SCHEDULE JOB OF USERS");
            _scheduleJobOfUser();
        },
        watchBirthDay() {
            console.log("--- SCHEDULE BIRTHDAY NOTIFY");
            _scheduleBirthdayUser();
        },
        watchToken() {
            console.log("--- SCHEDULE TOKEN");
            _scheduleRefreshToken();
            _scheduleAccessToken();
        },
    };
})();
