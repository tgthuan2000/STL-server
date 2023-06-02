import dotenv from "dotenv";
import { isEmpty } from "lodash";
import { ServiceSpending } from "~/@types/spending";
import { client } from "~/plugin/sanity";
import { getLongBudgetItemsById } from "~/schema/api/spending";

dotenv.config();

export const Spending = (() => {
    const _loop = <T>(data: T[], cb: (item: T) => void) => {
        if (!isEmpty(data)) {
            data.forEach((item) => {
                cb(item);
            });
        }
    };

    const _deleteLongBudget = async (budgetId: string) => {
        const items = await getLongBudgetItemsById(budgetId);
        const transaction = client.transaction();
        _loop(items, (itemId) => transaction.delete(itemId));
        transaction.delete(budgetId);
        await transaction.commit();
    };

    const services: ServiceSpending = {
        delete: {
            async longBudget(budgetId) {
                return _deleteLongBudget(budgetId);
            },
        },
    };

    return services;
})();
