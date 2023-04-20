import { SanityAssetDocument } from "@sanity/client";

export interface IUserProfile {
    _id: string;
    image: SanityAssetDocument | string;
    email: string;
    userName: string;
    google: string;
    isHasPassword: boolean;
    allowSendMail: boolean;
    birthDay?: Date;
    twoFA: boolean;
    base32: string;
    active: boolean;
}

export interface AccessToken {
    _id: string;
    exp: number;
    iat: number;
}

export interface IRefreshToken {
    _id: string;
    accessTokens: Array<{ _id: string }>;
}
