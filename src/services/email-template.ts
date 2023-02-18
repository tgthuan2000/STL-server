import { NotificationTemplate } from "~/@types/email-template";

export const notificationTemplate: NotificationTemplate = ({
    userName,
    url,
    notifyId,
}) => {
    return /*html*/ `
        <div style="margin: 20px; background-color: white;">
            <h1 style="line-height: 140%; font-size: 22px;">Xin chào ${userName}</h1>
            <p style="line-height: 140%;"><em>Bạn đang có một thông báo mới 🔔🔔</em></p>
            <div>Vui lòng truy cập vào <a href="${url}/notify/${notifyId}">Đường dẫn này</a> để xem thông báo</div>
        </div>
    `;
};
