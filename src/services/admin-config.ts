export interface IAdminConfig {
    canNotifyBirthday: boolean;
}

export const readAdminConfig = async (): Promise<IAdminConfig> => {
    console.log("/services/admin-config");
    console.log("--- READ ADMIN CONFIG ---");
    // const config = await client.fetch(
    //     '*[_type == "adminConfig"]{canNotifyBirthday}'
    // );
    return {
        canNotifyBirthday: true,
    };
};
