import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface UserEmail {
    _id: string;
    userName: string;
    email: string;
    allowSendMail: boolean;
    sendMail: boolean;
}

export type CreateSendMail = (
    data: Array<UserEmail> | undefined,
    callback: (mail: Promise<SMTPTransport.SentMessageInfo>) => void
) => void;

export type NotificationService = () => NotificationResult;

export type NotificationResult = {
    transaction: () => NotificationResult;
    setData: (data: any) => NotificationResult;
    setUrl: (url: string) => NotificationResult;
    createNotifyAssign: () => NotificationResult;
    createNotify: () => NotificationResult;
    execute: () => Promise<void>;
};

interface Option {
    subject: string;
    html: string;
}

export type HandleSendMail = <T>(
    to: string,
    option: Option
) => Promise<SMTPTransport.SentMessageInfo>;
