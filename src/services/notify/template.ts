import dotenv from "dotenv";
import { AssignUsers, NotifyData } from "~/@types/notification";
import { ISchedule, IUserBirthDay } from "~/@types/schedule";
import { NotifyService } from ".";
import {
    notificationTemplate,
    notifyBirthdayTemplate,
    scheduleTemplate,
} from "../email-template";

dotenv.config();

type UpdateNotifyData = Omit<NotifyData, "users" | "sendAll"> & {
    user: AssignUsers;
};

export const notify = {
    create: async (data: NotifyData, url: string) => {
        const transaction = NotifyService.transaction<NotifyData>(data);

        transaction.createNotify((data, notifyId) => ({
            document: {
                _id: notifyId,
                _type: "notify",
                title: data.title,
                description: data.description,
                content: data.content,
            },
        }));

        await transaction.createNotifyAssign((data, notifyId) => ({
            sendAll: data.sendAll,
            assignUsers: data.users,
            document: (d) => ({
                _type: "assignNotify",
                notify: { _type: "reference", _ref: notifyId },
                user: { _type: "reference", _ref: d._id },
                sentMail: Boolean(d.allowSendMail && d.sendMail),
                read: false,
            }),
            sendMailDocument: (d) => ({
                from: process.env.EMAIL_USER,
                to: d.email,
                subject: "Thông báo từ STL Admin",
                text: "Thông báo từ STL Admin nè",
                html: notificationTemplate({
                    userName: d.userName,
                    url,
                    notifyId,
                }),
            }),
        }));

        await transaction.execute();
    },
    put: async (notifyId: string, data: UpdateNotifyData, url: string) => {
        const transaction = NotifyService.transaction<UpdateNotifyData>(
            data,
            notifyId
        );

        transaction.updateNotify((data) => ({
            document: {
                title: data.title,
                description: data.description,
                content: data.content,
            },
        }));

        await transaction.updateNotifyAssign((data, notifyId) => ({
            assignUsers: data.user,
            document: (d) => ({
                _type: "assignNotify",
                notify: { _type: "reference", _ref: notifyId },
                user: { _type: "reference", _ref: d._id },
                sentMail: Boolean(d.allowSendMail && d.sendMail),
                read: false,
            }),
            sendMailDocument: (d) => ({
                from: process.env.EMAIL_USER,
                to: d.email,
                subject: "Thông báo từ STL Admin",
                text: "Thông báo từ STL Admin nè",
                html: notificationTemplate({
                    userName: d.userName,
                    url,
                    notifyId,
                }),
            }),
        }));

        await transaction.execute();
    },
};

export const notifySchedule = async (data: IUserBirthDay) => {
    const transaction = NotifyService.transaction<IUserBirthDay>(data);

    transaction.createNotify((data, notifyId) => ({
        document: {
            _id: notifyId,
            _type: "notify",
            title: "Chúc mừng sinh nhật",
            description: "Chúc mừng sinh nhật",
            content: `Chúc mừng sinh nhật <b>${data.userName}</b>`,
        },
    }));

    await transaction.createNotifyAssign((data, notifyId) => ({
        assignUsers: [
            {
                _id: data._id,
                allowSendMail: data.allowSendMail,
                sendMail: data.sendMail,
                email: data.email,
                userName: data.userName,
            },
        ],
        document: (d) => ({
            _type: "assignNotify",
            notify: { _type: "reference", _ref: notifyId },
            user: { _type: "reference", _ref: d._id },
            read: false,
        }),
        sendMailDocument: (d) => ({
            from: process.env.EMAIL_USER,
            to: d.email,
            subject: "Thông báo từ STL Admin",
            text: "Thông báo từ STL Admin nè",
            html: notifyBirthdayTemplate({
                userName: d.userName,
            }),
        }),
    }));

    await transaction.execute();
};

export const notifyScheduleJob = async (data: ISchedule) => {
    const transaction = NotifyService.transaction<ISchedule>(data);

    transaction.createNotify((data, notifyId) => ({
        document: {
            _id: notifyId,
            _type: "notify",
            title: "Thông báo lịch trình",
            description: data.title,
            content: data.description,
        },
    }));

    await transaction.createNotifyAssign((data, notifyId) => ({
        assignUsers: [
            {
                _id: data.user._id,
                allowSendMail: data.user.allowSendMail,
                sendMail: data.user.allowSendMail,
                email: data.user.email,
                userName: data.user.userName,
            },
        ],
        document: (d) => ({
            _type: "assignNotify",
            notify: { _type: "reference", _ref: notifyId },
            user: { _type: "reference", _ref: d._id },
            read: false,
        }),
        sendMailDocument: (d) => ({
            from: process.env.EMAIL_USER,
            to: d.email,
            subject: "Thông báo từ STL Admin",
            text: data.title,
            html: scheduleTemplate({
                userName: d.userName,
                title: data.title,
                description: data.description,
            }),
        }),
    }));

    await transaction.execute();
};
