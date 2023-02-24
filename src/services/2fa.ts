import AES from "crypto-js/aes";
import dotenv from "dotenv";
import speakeasy from "speakeasy";
import { Service2FA } from "~/@types/2fa";
import { client } from "~/plugin/sanity";

dotenv.config();

export const TwoFA = (() => {
    let _secrets: { [key: string]: string } = {};

    const _generateSecret = (email?: string) => {
        const secret = speakeasy.generateSecret({
            name: process.env.TWO_FA_APP_NAME + (email ? ` (${email})` : ""),
            issuer: process.env.TWO_FA_APP_NAME,
            length: 12,
        });
        return secret;
    };

    const _saveSanity = async (id: string, base32: string) => {
        const data = await client
            .patch(id)
            .set({ twoFA: true, base32 })
            .commit();

        _clearSecret(id);
        return data;
    };

    const _disabledTwoFA = async (id: string) => {
        const data = await client
            .patch(id)
            .set({ twoFA: false, base32: null })
            .commit();

        _clearSecret(id);
        return data;
    };

    const _clearSecret = (id: string) => {
        delete _secrets[id];
    };

    const _saveUserBase32 = (id: string, base32: string) => {
        _secrets[id] = base32;
    };

    const _getUserBase32 = (id: string) => {
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

    const _verifyToken = (token: string, base32: string) => {
        const verified = speakeasy.totp.verify({
            secret: base32,
            encoding: "base32",
            token,
            window: 2,
            digits: 6,
            algorithm: "sha1",
        });
        return verified;
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
        verifyToken(token, base32) {
            return _verifyToken(token, base32);
        },
        saveSanity(id, base32) {
            return _saveSanity(id, base32);
        },
        disabledTwoFA(id) {
            return _disabledTwoFA(id);
        },
    };
    return service;
})();
