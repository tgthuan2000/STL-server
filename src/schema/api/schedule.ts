import moment from "moment";
import { client } from "~/plugin/sanity";
import { GET_SCHEDULES } from "../query/schedule";
import { ISchedule } from "~/@types/schedule";

export const getScheduleJobOfUsers = () => {
    return client.fetch<ISchedule[]>(GET_SCHEDULES, {
        from: moment().format("YYYY-MM-DD"),
        to: moment().add(1, "days").format("YYYY-MM-DD"),
    });
};
