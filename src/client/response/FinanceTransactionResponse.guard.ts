/*
 * Generated type guards for "FinanceTransactionResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { isFinanceTransaction } from "../../components/HouseholdView/FinancesView/finance-types.guard";
import { FinanceTransactionResponse } from "./FinanceTransactionResponse";

export function isFinanceTransactionResponse(obj: unknown): obj is FinanceTransactionResponse {
    const typedObj = obj as FinanceTransactionResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        Array.isArray(typedObj["transactions"]) &&
        typedObj["transactions"].every((e: any) =>
            isFinanceTransaction(e) as boolean
        )
    )
}
