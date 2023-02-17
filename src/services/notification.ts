import emailjs, { EmailJSResponseStatus } from "@emailjs/browser";
import { Transaction } from "@sanity/client";
import { uuid } from "@sanity/uuid";
import { isEmpty } from "lodash";
import {
    CreateSendMail,
    NotificationResult,
    NotificationService,
    UserEmail,
} from "~/@types/notification";
import { EMAIL_TEMPLATES } from "~/constant/email-template";
import { client } from "~/plugin/sanity";
import { GET_USERS_ID } from "~/schema/query/auth";

export const notificationService: NotificationService = () => {
    let _data: any | null = null,
        _url: string | null = null,
        __: Transaction | null = null,
        _notifyId: string | null = null,
        _sentUsers: Array<Promise<EmailJSResponseStatus>> = [];

    const _createNotifyId = () => {
        _notifyId = uuid();
    };

    const _createTrans = () => {
        if (__ === null) {
            __ = client.transaction();
        }
        return __;
    };

    const _execute = async () => {
        await __?.commit();
    };

    const _createNotifyAssign = async (
        data: Array<{ _id: string }> | undefined
    ) => {
        _createNotifyId();
        if (!isEmpty(data)) {
            data?.forEach((d) => {
                const doc = {
                    _type: "assignNotify",
                    notify: { _type: "reference", _ref: _notifyId },
                    user: { _type: "reference", _ref: d._id },
                    read: false,
                };
                __?.create(doc);
            });
        }
    };

    const _createSendMail: CreateSendMail = (data, callback) => {
        if (!isEmpty(data)) {
            data?.filter(
                (d, i, s) => d.allowSendMail && d.sendMail && s.indexOf(d) === i
            ).forEach((d) => {
                if (
                    !d.email ||
                    !d.userName ||
                    !_notifyId ||
                    !process.env.APP_URL
                ) {
                    return;
                }
                const mail = emailjs.send(
                    process.env.EMAIL_SERVICE,
                    EMAIL_TEMPLATES.NEW_NOTIFY,
                    {
                        to_name: d.userName,
                        to_email: d.email,
                        url: `${_url}/notify/${_notifyId}`,
                    }
                );
                callback(mail);
            });
        }
    };

    const _clear = () => {
        _data = null;
        __ = null;
        _notifyId = null;
        _sentUsers = [];
    };

    const service: NotificationResult = {
        setData(data) {
            _clear();
            _createTrans();
            _data = data;
            return service;
        },
        setUrl(url) {
            _url = url;
            return service;
        },
        createNotifyAssign() {
            if (_data.sendAll) {
                client.fetch<Array<UserEmail>>(GET_USERS_ID).then((users) => {
                    _createNotifyAssign(users);
                    /* Xử lí gửi email */
                    _createSendMail(users, (d) => _sentUsers.push(d));
                });
            } else {
                _createNotifyAssign(_data.users);
                /* Xử lí gửi email */
                _createSendMail(_data.users, (d) => _sentUsers.push(d));
            }
            return service;
        },
        createNotify() {
            const documentCreateNotify = {
                _id: _notifyId,
                _type: "notify",
                title: _data.title,
                description: _data.description,
                content: _data.content,
            };
            __.createIfNotExists(documentCreateNotify);
            return service;
        },
        async execute() {
            await _execute();
            if (!isEmpty(_sentUsers)) {
                await Promise.all(_sentUsers);
            }
            _clear();
        },
    };

    return service;
};
