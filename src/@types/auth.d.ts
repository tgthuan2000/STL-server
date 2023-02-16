import { SanityAssetDocument } from "@sanity/client";

export interface IUserProfile {
    _id: string;
    image: SanityAssetDocument | string;
    email: string;
    userName: string;
    google: string;
    isHasPassword: boolean;
    allowSendMail: boolean;
}

export interface AccessToken {
    _id: string;
    exp: number;
    iat: number;
}
