import dotenv from "dotenv";
import { NotifyData } from "~/@types/notification";
import { IUserBirthDay } from "~/@types/schedule";
import { NotifyService } from ".";
import { notificationTemplate } from "../email-template";

dotenv.config();

export const notify = async (data: NotifyData, url: string) => {
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
            sentMail: d.sendMail,
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
            html: `Chúc mừng sinh nhật <b>${d.userName}</b>`,
        }),
    }));

    await transaction.execute();
};
