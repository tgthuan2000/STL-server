import groq from "groq";

export const GET_SCHEDULES = groq`
    *[_type == "schedule" && startDate > $from && startDate < $to] {
        _id,
        title,
        description,
        startDate,
        endDate,
        user-> {
            _id,
            userName,
            email,
            allowSendMail,
            image
        }
    }
`;
