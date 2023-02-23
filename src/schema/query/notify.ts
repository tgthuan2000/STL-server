import groq from "groq";

export const SUBSCRIPTION_NOTIFY = groq`
    *[_type == "assignNotify"]
`;
