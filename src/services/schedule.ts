import { SanityDocument } from "@sanity/client";
import jwtDecode from "jwt-decode";
import { isEmpty } from "lodash";
import schedule from "node-schedule";
import { IUserBirthDay } from "~/@types/schedule";
import { client } from "~/plugin/sanity";
import {
    GET_ACCESS_TOKEN_EXPIRED,
    GET_REFRESH_TOKEN_EXPIRED,
    GET_USERS_BIRTHDAY,
} from "~/schema/query/auth";
import { notifySchedule } from "./notify/template";
import { IRefreshToken } from "~/@types/auth";
import {
    getAccessTokenExpired,
    getRefreshTokenExpired,
} from "~/schema/api/auth";

const _pad = (d: number) => (d < 10 ? "0" + d.toString() : d.toString());

const _getUsers = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = _pad(tomorrow.getDate());
    const month = _pad(tomorrow.getMonth() + 1);

    return await client.fetch<IUserBirthDay[]>(GET_USERS_BIRTHDAY, {
        birthDay: "*" + month + "-" + date,
    });
};

const _createBirthdaySchedule = (user: IUserBirthDay) => {
    const { birthDay } = user;
    const date = new Date(birthDay);
    const rule = new schedule.RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;
    rule.second = 0;
    rule.date = date.getDate();
    rule.month = date.getMonth();

    schedule.scheduleJob(rule, () => {
        notifySchedule(user);
    });
};

export const ScheduleService = (() => {
    console.log("services/schedule");

    const _scheduleBirthdayUser = () => {
        schedule.scheduleJob("0 23 * * *", async () => {
            const users = await _getUsers();
            console.log(
                "Users have birthday:",
                users.map((user) => user.userName).join(", ")
            );
            users.forEach((user) => {
                _createBirthdaySchedule(user);
            });
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

    const _Schedule = () => {};

    return {
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
