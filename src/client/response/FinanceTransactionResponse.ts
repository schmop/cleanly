import { FinanceTransaction } from "@/components/HouseholdView/FinancesView/finance-types";

/** @see {isFinanceTransactionResponse} ts-auto-guard:type-guard */
export type FinanceTransactionResponse = {
    transactions: FinanceTransaction[],
}