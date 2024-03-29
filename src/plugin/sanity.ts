import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: "production",
    apiVersion: process.env.SANITY_VERSION_API,
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    ignoreBrowserTokenWarning: true,
});

export { client };
