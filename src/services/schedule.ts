import { SanityDocument, Transaction } from "@sanity/client";
import jwtDecode from "jwt-decode";
import { isEmpty } from "lodash";
import schedule from "node-schedule";
import { IUserBirthDay } from "~/@types/schedule";
import { client } from "~/plugin/sanity";
import {
    GET_ACCESS_TOKEN,
    GET_REFRESH_TOKEN,
    GET_USERS_BIRTHDAY,
} from "~/schema/query/auth";
import { getAccessByRefreshToken } from "./auth";
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

    const __handler = async (
        getTokens: () => Promise<Array<{ _id: string }>>,
        callback: (
            token: string,
            transaction: Transaction
        ) => void | Promise<void>,
        transaction?: Transaction
    ) => {
        const tokens = await getTokens();
        const _transaction = transaction ?? client.transaction();

        if (!isEmpty(tokens)) {
            for (const token of tokens) {
                await callback(token._id, _transaction);
            }
        }
        return _transaction;
    };

    const _watchAccessToken = () => {
        // check access token expired each 1 day - "0 0 * * *"
        schedule.scheduleJob("0 0 * * *", async () => {
            console.log("--- CHECK ACCESS TOKEN", new Date());
            const transaction = await __handler(
                _getAccessToken,
                (token, transaction) => {
                    const isActive = _checkTokenIsActive(token);
                    if (!isActive) {
                        transaction.delete(token);
                    }
                }
            );
            await transaction.commit();
        });
    };

    const _watchRefreshToken = () => {
        // check refresh token expired each 15 day - "0 0 15 * 1"
        schedule.scheduleJob("0 0 15 * 1", async () => {
            console.log("--- CHECK REFRESH TOKEN", new Date());
            const expiredRefreshTokens: string[] = [];
            const transaction = client.transaction();
            await __handler(
                _getRefreshToken,
                (token, transaction) => {
                    const isActive = _checkTokenIsActive(token);
                    if (!isActive) {
                        expiredRefreshTokens.push(token);
                        transaction.delete(token);
                    }
                },
                transaction
            );

            if (isEmpty(expiredRefreshTokens)) {
                await transaction.commit();
                return;
            }

            for (const token of expiredRefreshTokens) {
                await __handler(
                    () => getAccessByRefreshToken(token),
                    (token, transaction) => {
                        transaction.delete(token);
                    },
                    transaction
                );
            }
            await transaction.commit();
        });
    };

    const _getAccessToken = async () => {
        try {
            const data = await client.fetch<Array<{ _id: string }>>(
                GET_ACCESS_TOKEN
            );
            return data;
        } catch (error) {
            console.log(error);
        }
    };

    const _getRefreshToken = async () => {
        try {
            const data = await client.fetch<
                Array<{ _id: string; token: string }>
            >(GET_REFRESH_TOKEN);
            return data;
        } catch (error) {
            console.log(error);
        }
    };

    const _checkTokenIsActive = (token: string): boolean => {
        const { exp } = jwtDecode<{ exp: number }>(token);
        return exp * 1000 > Date.now();
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
