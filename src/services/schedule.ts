import schedule from "node-schedule";
import { IUserBirthDay } from "~/@types/schedule";
import { client } from "~/plugin/sanity";
import { GET_USERS_BIRTHDAY } from "~/schema/query/auth";
import { notifySchedule } from "./notify/template";

export const scheduleService = () => {
    console.log("services/schedule");
    console.log("--- SCHEDULE SERVICE ---");

    const _getUsers = async () => {
        return await client.fetch<IUserBirthDay[]>(GET_USERS_BIRTHDAY);
    };

    const _scheduleNotify = (data: IUserBirthDay[]) => {
        data.forEach((user) => {
            _schedule(user);
        });
    };

    const _watchNewUsers = () => {
        const sub = client.listen(GET_USERS_BIRTHDAY).subscribe((event) => {
            // _schedule()
            // sub.unsubscribe();
        });
    };

    const _schedule = (user: IUserBirthDay) => {
        const { birthDay } = user;
        const birthDayDate = new Date(birthDay);
        const birthDayMonth = birthDayDate.getMonth();
        const birthDayDay = birthDayDate.getDate();
        const birthDayHour = 0;
        const birthDayMinute = 0;
        const birthDaySecond = 0;

        const birthDaySchedule = new Date(
            birthDayDate.getFullYear(),
            birthDayMonth,
            birthDayDay,
            birthDayHour,
            birthDayMinute,
            birthDaySecond
        );

        schedule.scheduleJob(birthDaySchedule, async () => {
            await notifySchedule(user);
        });
    };

    return {
        birthDayNotification: async () => {
            console.log("--- BIRTHDAY NOTIFICATION ---");
            const users = await _getUsers();
            _scheduleNotify(users);
            _watchNewUsers();
        },
    };
};
