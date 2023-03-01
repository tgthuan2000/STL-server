import { SanityDocument } from "@sanity/client";
import jwtDecode from "jwt-decode";
import { isEmpty } from "lodash";
import schedule from "node-schedule";
import { IUserBirthDay } from "~/@types/schedule";
import { client } from "~/plugin/sanity";
import {
    GET_USERS_ACCESS_TOKEN,
    GET_USERS_BIRTHDAY,
    GET_USERS_REFRESH_TOKEN,
} from "~/schema/query/auth";
import { notifySchedule } from "./notify/template";

export const ScheduleService = (() => {
    console.log("services/schedule");

    const _jobs: { [x: string]: schedule.Job } = {};

    const _getUsers = async () => {
        return await client.fetch<IUserBirthDay[]>(GET_USERS_BIRTHDAY);
    };

    const _scheduleNotify = (data: IUserBirthDay[]) => {
        data.forEach((user) => {
            _birthdaySchedule(user);
        });
    };

    const _getScheduleData = (user: SanityDocument<Record<string, any>>) => ({
        _id: user._id,
        allowSendMail: user.allowSendMail,
        birthDay: user.birthDay,
        email: user.email,
        sendMail: user.allowSendMail,
        userName: user.userName,
    });

    const _watchNewUsers = () => {
        const sub = client.listen(GET_USERS_BIRTHDAY).subscribe((update) => {
            if (update.documentId.includes("drafts")) return;

            const user = update.result;

            switch (update.transition) {
                case "appear":
                    if (user?.birthDay) {
                        _birthdaySchedule(_getScheduleData(user));
                    }
                    break;
                case "update":
                    if (user?.birthDay) {
                        const job = _checkInJobs(user._id);
                        if (job) {
                            const newBirthDay = new Date(user.birthDay);
                            const oldBirthDay = new Date(job.nextInvocation());
                            if (newBirthDay !== oldBirthDay) {
                                _removeJob(user._id);
                                _birthdaySchedule(_getScheduleData(user));
                            }
                        }
                    }
                    break;
                case "disappear":
                    _removeJob(update.documentId);
                    break;
            }
            // _logJob();
        });
    };

    const _birthdaySchedule = (user: IUserBirthDay) => {
        const { birthDay } = user;
        const date = new Date(birthDay);
        const rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 0;
        rule.second = 0;
        rule.date = date.getDate();
        rule.month = date.getMonth();

        const job = schedule.scheduleJob(rule, () => {
            notifySchedule(user);
        });

        _pushJob(user._id, job);
    };

    const _pushJob = (key: string, job: schedule.Job) => {
        _jobs[key] = job;
    };

    const _removeJob = (_id: string) => {
        const job = _jobs[_id];
        if (job) {
            _jobs[_id].cancel();
            delete _jobs[_id];
        }
    };

    const _checkInJobs = (_id: string) => {
        return _jobs[_id];
    };

    const _logJob = () => {
        Object.keys(_jobs).forEach((key) => {
            console.log(key, _jobs[key].nextInvocation().toISOString());
        });
    };

    const _watchAccessToken = () => {
        // check access token expired each 1 hour - "*/1 * * *"
        schedule.scheduleJob("*/1 * * *", async () => {
            console.log("--- CHECK ACCESS TOKEN");
            const users = await _getUsersAccessToken();
            if (!isEmpty(users)) {
                const transaction = client.transaction();
                users.forEach((user) => {
                    const activeTokens = _getActiveTokens(user.accessToken);
                    if (activeTokens) {
                        const update = client
                            .patch(user._id)
                            .setIfMissing({ accessToken: [] });

                        if (isEmpty(activeTokens)) {
                            update.unset(["accessToken"]);
                        } else {
                            update.set({ accessToken: activeTokens });
                        }

                        transaction.patch(update);
                    }
                });
                console.log(transaction.toJSON());
                await transaction.commit();
            }
        });
    };

    const _watchRefreshToken = () => {
        // check refresh token expired each 15 day - "*/15 * *"
        schedule.scheduleJob("*/15 * *", async () => {
            console.log("--- CHECK REFRESH TOKEN");
            const users = await _getUsersRefreshToken();
            if (!isEmpty(users)) {
                const transaction = client.transaction();
                users.forEach((user) => {
                    const activeTokens = _getActiveTokens(user.refreshToken);
                    if (activeTokens) {
                        const update = client
                            .patch(user._id)
                            .setIfMissing({ refreshToken: [] });

                        if (isEmpty(activeTokens)) {
                            update.unset(["refreshToken"]);
                        } else {
                            update.set({ refreshToken: activeTokens });
                        }

                        transaction.patch(update);
                    }
                });
                console.log(transaction.toJSON());
                await transaction.commit();
            }
        });
    };

    const _getUsersAccessToken = async () => {
        try {
            const data = await client.fetch<
                Array<{ _id: string; accessToken: string[] }>
            >(GET_USERS_ACCESS_TOKEN);
            return data;
        } catch (error) {
            console.log(error);
        }
    };

    const _getUsersRefreshToken = async () => {
        try {
            const data = await client.fetch<
                Array<{ _id: string; refreshToken: string[] }>
            >(GET_USERS_REFRESH_TOKEN);
            return data;
        } catch (error) {
            console.log(error);
        }
    };

    const _getActiveTokens = (tokens: string[]): string[] => {
        if (isEmpty(tokens)) {
            return [];
        }
        const activeTokens = tokens.filter((token) => {
            const { exp } = jwtDecode<{ exp: number }>(token);
            if (exp * 1000 < Date.now()) {
                return false;
            }
            return true;
        });
        return activeTokens;
    };

    return {
        watchBirthDay() {
            console.log("--- SCHEDULE BIRTHDAY NOTIFY");

            _getUsers().then((users) => {
                _scheduleNotify(users);
                _watchNewUsers();
                // _logJob();
            });
        },
        watchToken() {
            console.log("--- SCHEDULE TOKEN");
            _watchRefreshToken();
            _watchAccessToken();
        },
    };
})();
