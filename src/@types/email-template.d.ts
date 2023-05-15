interface NotificationTemplateOption {
    userName: string;
    url: string;
    notifyId: string;
}
export type NotificationTemplate = (
    options: NotificationTemplateOption
) => string;

interface ScheduleTemplateOption {
    userName: string;
    title: string;
    description: string;
}

export type ScheduleTemplate = (options: ScheduleTemplateOption) => string;
