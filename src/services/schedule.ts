import { SanityDocument } from "@sanity/client";
import schedule from "node-schedule";
import { IUserBirthDay } from "~/@types/schedule";
import { client } from "~/plugin/sanity";
import { GET_USERS_BIRTHDAY } from "~/schema/query/auth";
import { notifySchedule } from "./notify/template";

interface Job {
    _id: string;
    job: schedule.Job;
}
export const scheduleService = () => {
    console.log("services/schedule");
    console.log("--- SCHEDULE SERVICE ---");

    const _jobs: Array<Job> = [];

    const _getUsers = async () => {
        return await client.fetch<IUserBirthDay[]>(GET_USERS_BIRTHDAY);
    };

    const _scheduleNotify = (data: IUserBirthDay[]) => {
        data.forEach((user) => {
            _schedule(user);
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
                        _schedule(_getScheduleData(user));
                    }
                    break;
                case "update":
                    if (user?.birthDay) {
                        const job = checkInJobs(user._id);
                        if (job) {
                            const newBirthDay = new Date(user.birthDay);
                            const oldBirthDay = new Date(
                                job.job.nextInvocation()
                            );
                            if (newBirthDay !== oldBirthDay) {
                                _removeJob(user._id);
                                _schedule(_getScheduleData(user));
                            }
                        }
                    }
                    break;
                case "disappear":
                    _removeJob(update.documentId);
                    break;
            }
            _logJob();
        });
    };

    const _schedule = (user: IUserBirthDay) => {
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

        _pushJob({ _id: user._id, job });
    };

    const _pushJob = (data: Job) => {
        _jobs.push(data);
    };

    const _removeJob = (_id: string) => {
        const index = _jobs.findIndex((job) => job._id === _id);
        if (index !== -1) {
            _jobs[index].job.cancel();
            _jobs.splice(index, 1);
        }
    };

    const checkInJobs = (_id: string) => {
        return _jobs.find((job) => job._id === _id);
    };

    const _logJob = () => {
        _jobs.forEach((job) => {
            console.log(job._id, job.job.nextInvocation().toISOString());
        });
    };

    return {
        birthDayNotification: async () => {
            console.log("--- BIRTHDAY NOTIFICATION ---");
            const users = await _getUsers();
            _scheduleNotify(users);
            _watchNewUsers();
            _logJob();
        },
    };
};
