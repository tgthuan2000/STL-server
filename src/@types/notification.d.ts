import SMTPTransport from "nodemailer/lib/smtp-transport";
import { IUserProfile } from "./auth";

export interface UserEmail {
    _id: string;
    userName: string;
    email: string;
    allowSendMail: boolean;
    sendMail: boolean;
}

export type CreateSendMail = (
    data: Array<UserEmail> | undefined,
    sendMailDocument: (data: UserEmail) => any,
    callback: (mail: Promise<SMTPTransport.SentMessageInfo>) => void
) => void;

export type CreateNotifyAssign = (
    data: Array<UserEmail> | undefined,
    document: (data: UserEmail) => any
) => void;

export type NotifyUpdate = {
    _id: string;
    sentMail: boolean;
    user: IUserProfile & { sendMail: boolean };
};

export type UpdateNotifyAssign = (
    data: Array<NotifyUpdate> | undefined
) => UserEmail[];

export type DeleteNotifyAssign = (data: Array<string> | undefined) => void;

export type NotificationService = () => NotificationResult;

export type CreateNotifyAssignCallback<T> = (
    data: T,
    notifyId: string
) => {
    sendAll?: boolean;
    assignUsers: Array<UserEmail>;
    document: (data: UserEmail) => any;
    sendMailDocument: (data: UserEmail) => any;
};

export interface AssignUsers {
    updates: Array<NotifyUpdate>;
    deletes: Array<string>;
    creates: Array<UserEmail>;
}

export type UpdateNotifyAssignCallback<T> = (
    data: T,
    notifyId: string
) => {
    assignUsers: AssignUsers;
    document: (data: UserEmail) => any;
    sendMailDocument: (data: UserEmail) => any;
};

export type CreateNotifyCallback<T> = (
    data: T,
    notifyId: string
) => {
    document: any;
};

export type UpdateNotifyCallback<T> = (data: T) => {
    document: any;
};

export interface NotifyTransaction<T> {
    createNotifyAssign: (
        callback: CreateNotifyAssignCallback<T>
    ) => Promise<NotifyTransaction<T>>;
    createNotify: (callback: CreateNotifyCallback<T>) => NotifyTransaction<T>;
    updateNotifyAssign: (
        callback: UpdateNotifyAssignCallback<T>
    ) => Promise<NotifyTransaction<T>>;
    updateNotify: (callback: UpdateNotifyCallback<T>) => NotifyTransaction<T>;
    execute: () => Promise<void>;
}

export type NotificationResult = {
    transaction: <T>(data: T, notifyId?: string) => NotifyTransaction<T>;
};

interface Option {
    subject: string;
    html: string;
}

export type HandleSendMail = <T>(
    to: string,
    option: Option
) => Promise<SMTPTransport.SentMessageInfo>;

export interface NotifyData {
    title?: string;
    content?: string;
    description?: string;
    users?: Array<IUserProfile & { sendMail: boolean }>;
    sendAll?: boolean;
}
