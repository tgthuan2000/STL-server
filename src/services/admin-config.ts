export interface IAdminConfig {
    canNotifyBirthday: boolean;
}

export const readAdminConfig = async (): Promise<IAdminConfig> => {
    console.log("services/admin-config");

    return {
        canNotifyBirthday: true,
    };
};
