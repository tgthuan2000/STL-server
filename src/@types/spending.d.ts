interface ServiceSpendingDelete {
    longBudget: (budgetId: string) => Promise<void>;
}
export interface ServiceSpending {
    delete: ServiceSpendingDelete;
}
