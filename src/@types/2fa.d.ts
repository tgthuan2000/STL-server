import speakeasy from "speakeasy";

export interface Service2FA {
    generateSecret: (userName?: string) => speakeasy.GeneratedSecret;
    saveUserBase32: (id: string, base32: string) => void;
    getUserBase32: (id: string) => string;
    generateBackupCodes: (base32: string) => {
        backupCodes: string[];
        hashedBackupCodes: string[];
    };
    generateQRCode: (otpAuthUrl: string) => Promise<string>;
    verifyToken: (token: string, base32: string) => boolean;
    log: () => void;
}
