import AES from "crypto-js/aes";
import dotenv from "dotenv";
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { Service2FA } from "~/@types/2fa";

dotenv.config();

export const TwoFA = (() => {
    let _secrets: { [key: string]: string } = {};

    const _generateSecret = (email?: string) => {
        const secret = speakeasy.generateSecret({
            name: process.env.TWO_FA_APP_NAME + (email ? ` (${email})` : ""),
        });
        return secret;
    };

    const _saveUserBase32 = (id: string, base32: string) => {
        _secrets[id] = base32;
    };

    const _getUserBase32 = (id: string): string => {
        return _secrets[id];
    };

    const _generateBackupCodes = (base32: string) => {
        const backupCodes = [];
        const hashedBackupCodes = [];
        for (let i = 0; i < 10; i++) {
            const randomCode = (Math.random() * 10000000000).toFixed();
            const encrypted = AES.encrypt(randomCode, base32).toString();
            backupCodes.push(randomCode);
            hashedBackupCodes.push(encrypted);
        }
        return { backupCodes, hashedBackupCodes };
    };

    const _generateQRCode = (otpAuthUrl: string) => {
        return QRCode.toDataURL(otpAuthUrl);
    };

    const _verifyToken = (token: string, base32: string) => {
        const verified = speakeasy.totp.verify({
            secret: base32,
            encoding: "base32",
            token,
            window: 2,
        });
        return verified;
    };

    const _log = () => {
        console.log(_secrets);
    };

    const service: Service2FA = {
        generateSecret(userName) {
            return _generateSecret(userName);
        },
        saveUserBase32(id, secret) {
            _saveUserBase32(id, secret);
        },
        getUserBase32(id) {
            return _getUserBase32(id);
        },
        generateBackupCodes(base32) {
            return _generateBackupCodes(base32);
        },
        generateQRCode(otpAuthUrl) {
            return _generateQRCode(otpAuthUrl);
        },
        verifyToken(token, base32) {
            return _verifyToken(token, base32);
        },
        log() {
            _log();
        },
    };
    return service;
})();
