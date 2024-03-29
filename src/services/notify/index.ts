import { Transaction } from "@sanity/client";
import { uuid } from "@sanity/uuid";
import dotenv from "dotenv";
import { get, isEmpty } from "lodash";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {
    CreateNotifyAssign,
    CreateSendMail,
    DeleteNotifyAssign,
    NotificationResult,
    NotifyTransaction,
    UpdateNotifyAssign,
    UserEmail,
} from "~/@types/notification";
import { transporter } from "~/plugin/email";
import { client } from "~/plugin/sanity";
import { GET_USERS } from "~/schema/query/auth";

dotenv.config();

export const NotifyService = (() => {
    console.log("services/notify");

    const service: NotificationResult = {
        transaction<T>(data: T, notifyId?: string) {
            let _data: T | null = data,
                __: Transaction | null = null,
                _notifyId: string | null = null,
                _sentUsers: Array<Promise<SMTPTransport.SentMessageInfo>> = [];

            const _createNotifyId = () => {
                _notifyId = notifyId ?? uuid();
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

            const _createNotifyAssign: CreateNotifyAssign = (
                data,
                document
            ) => {
                if (!isEmpty(data)) {
                    data?.forEach((d) => {
                        __?.create(document(d));
                    });
                }
            };

            const _updateNotifyAssign: UpdateNotifyAssign = (data) => {
                const userEmails: UserEmail[] = [];
                if (!isEmpty(data)) {
                    data.forEach((d) => {
                        if (!d.sentMail) {
                            const sendMail = d.user.sendMail;
                            if (sendMail) {
                                userEmails.push(d.user);
                            }
                            __?.patch(d._id, {
                                set: { sentMail: sendMail },
                            });
                        }
                    });
                }
                return userEmails;
            };

            const _deleteNotifyAssign: DeleteNotifyAssign = (data) => {
                if (!isEmpty(data)) {
                    data.forEach((d) => {
                        __?.delete(d);
                    });
                }
            };

            const _createSendMail: CreateSendMail = (
                data,
                sendMailDocument,
                callback
            ) => {
                if (!isEmpty(data)) {
                    data?.filter(
                        (d, i, s) =>
                            d.allowSendMail && d.sendMail && s.indexOf(d) === i
                    ).forEach((d) => {
                        const doc = sendMailDocument(d);
                        const mail = transporter.sendMail(doc);
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

            const _log = (
                result: PromiseSettledResult<SMTPTransport.SentMessageInfo>
            ) => {
                console.log({
                    status: result.status,
                    accepted: get(result, "value.accepted", []),
                    rejected: get(result, "value.rejected", []),
                    time: new Date().toLocaleString(),
                });
            };

            _createTrans();
            _createNotifyId();

            const transactionServices: NotifyTransaction<T> = {
                async createNotifyAssign(cb) {
                    const {
                        sendAll = false,
                        assignUsers,
                        document,
                        sendMailDocument,
                    } = cb(_data, _notifyId);

                    if (sendAll) {
                        const users = await client.fetch<Array<UserEmail>>(
                            GET_USERS
                        );
                        _createNotifyAssign(users, document);
                        _createSendMail(users, sendMailDocument, (d) =>
                            _sentUsers.push(d)
                        );
                    } else {
                        _createNotifyAssign(assignUsers, document);
                        _createSendMail(assignUsers, sendMailDocument, (d) =>
                            _sentUsers.push(d)
                        );
                    }
                    return this;
                },
                async updateNotifyAssign(cb) {
                    const { assignUsers, document, sendMailDocument } = cb(
                        _data,
                        _notifyId
                    );

                    const { creates, deletes, updates } = assignUsers;

                    _createNotifyAssign(creates, document);
                    const usersNotify = _updateNotifyAssign(updates);
                    _deleteNotifyAssign(deletes);

                    _createSendMail(
                        creates.concat(usersNotify),
                        sendMailDocument,
                        (d) => _sentUsers.push(d)
                    );

                    return this;
                },
                createNotify(cb) {
                    const { document } = cb(_data, _notifyId);
                    __.createIfNotExists(document);
                    return this;
                },
                updateNotify(cb) {
                    const { document } = cb(_data);
                    __.patch(_notifyId, { set: document });
                    return this;
                },
                async execute() {
                    await _execute();
                    if (!isEmpty(_sentUsers)) {
                        Promise.allSettled(_sentUsers).then((results) => {
                            results.forEach((result) => _log(result));
                        });
                    }
                    _clear();
                },
            };
            return transactionServices;
        },
    };

    return service;
})();
