interface NotificationTemplateOption {
    userName: string;
    url: string;
    notifyId: string;
}
export type NotificationTemplate = (
    option: NotificationTemplateOption
) => string;
