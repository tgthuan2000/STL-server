import dotenv from "dotenv";
import nodeMailer from "nodemailer";

dotenv.config();

export const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        ciphers: "SSLv3",
    },
});
