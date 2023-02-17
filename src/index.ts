import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { auth, notification, schedule } from "~/routes";
import { verifyToken } from "./services/auth";
import emailjs from "@emailjs/browser";

dotenv.config();

emailjs.init(process.env.EMAIL_PUBLIC_KEY);

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", auth);
app.use("/api/schedule", verifyToken, schedule);
app.use("/api/notification", verifyToken, notification);

app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
