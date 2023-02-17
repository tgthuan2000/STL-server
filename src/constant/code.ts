export enum CODE {
    /* COMMON */
    SUCCESS = "SUCCESS",
    FORBIDDEN = "FORBIDDEN",

    /* REQUIRED */
    REQUIRED_EMAIL = "REQUIRED_EMAIL",
    REQUIRED_ID = "REQUIRED_ID",
    REQUIRED_PASSWORD = "REQUIRED_PASSWORD",
    REQUIRED_CREDENTIAL = "REQUIRED_CREDENTIAL",
    REQUIRED_REFRESH_TOKEN = "REQUIRED_REFRESH_TOKEN",

    /* INVALID */
    INVALID_PASSWORD = "INVALID_PASSWORD",
    INVALID_OLD_PASSWORD = "INVALID_OLD_PASSWORD",

    /* TOKEN */
    ACCESS_TOKEN_EXPIRED = "ACCESS_TOKEN_EXPIRED",
    REFRESH_TOKEN_EXPIRED = "REFRESH_TOKEN_EXPIRED",
}
