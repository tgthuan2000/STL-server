import { IUserProfile } from "./auth";

export interface IUserBirthDay {
    _id: string;
    userName: string;
    email: string;
    birthDay: Date;
    allowSendMail: boolean;
    sendMail: boolean;
}

export interface ScheduleLoop {
    _id: string;
    key: string;
    name: string;
}

export interface ISchedule {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    loop: ScheduleLoop;
    user: IUserProfile;
}
