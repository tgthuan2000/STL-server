import groq from "groq";

export const GET_LONG_BUDGET_ITEMS_BY_ID = groq`
    *[_type == "longBudgetItem" && budget._ref == $_id]._id
`;
