import {
    NotificationTemplate,
    NotifyBirthdayTemplate,
    ScheduleTemplate,
} from "~/@types/email-template";

export const notificationTemplate: NotificationTemplate = (options) => {
    const { userName, url, notifyId } = options;

    return /*html*/ `
        <div style="margin: 20px; background-color: white;">
            <h1 style="line-height: 140%; font-size: 22px;">Xin chào ${
                userName ?? "Bạn"
            }</h1>
            <p style="line-height: 140%;"><em>Bạn đang có một thông báo mới 🔔🔔</em></p>
            <div>Vui lòng truy cập vào <a href="${url}/notify/${notifyId}">Đường dẫn này</a> để xem thông báo</div>
        </div>
    `;
};

export const scheduleTemplate: ScheduleTemplate = (options) => {
    const { userName, description, title } = options;

    return /*html*/ `
    <div style="margin: 20px; background-color: white;">
        <h1 style="line-height: 140%; font-size: 22px;">Xin chào ${
            userName ?? "Bạn"
        }</h1>
        <p style="line-height: 140%;"><em>Bạn đang có một thông báo về lịch trình sắp diễn ra 🔔🔔</em></p>
        <h4>${title}</h4>
        <div>
            ${description ?? ""}
        </div>
    </div>
`;
};

export const notifyBirthdayTemplate: NotifyBirthdayTemplate = (options) => {
    const { userName } = options;

    return /*html*/ `
    <div style="margin: 20px; background-color: white;">
        <h1 style="line-height: 140%; font-size: 22px;">Xin chào ${
            userName ?? "Bạn"
        }</h1>
        <p style="line-height: 140%;"><em>Happy birthday to you 🎉🎉🎉 - Chúc bạn sinh nhật vui vẻ 🎉🎉🎉</em></p>
    </div>
`;
};
