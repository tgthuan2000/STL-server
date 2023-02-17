import { EmailJSResponseStatus } from "@emailjs/browser";

export interface UserEmail {
    _id: string;
    userName: string;
    email: string;
    allowSendMail: boolean;
    sendMail: boolean;
}

export type CreateSendMail = (
    data: Array<UserEmail> | undefined,
    callback: (mail: Promise<EmailJSResponseStatus>) => void
) => void;

export type NotificationService = () => NotificationResult;

export type NotificationResult = {
    setData: (data: any) => NotificationResult;
    setUrl: (url: string) => NotificationResult;
    createNotifyAssign: () => NotificationResult;
    createNotify: () => NotificationResult;
    execute: () => Promise<void>;
};
