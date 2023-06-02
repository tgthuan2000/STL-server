import { client } from "~/plugin/sanity";
import { GET_LONG_BUDGET_ITEMS_BY_ID } from "../query/spending";

export const getLongBudgetItemsById = (_id: string) => {
    return client.fetch<string[]>(GET_LONG_BUDGET_ITEMS_BY_ID, {
        _id,
    });
};
