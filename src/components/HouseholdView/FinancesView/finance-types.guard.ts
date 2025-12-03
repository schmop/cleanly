/*
 * Generated type guards for "finance-types.ts".
 * WARNING: Do not manually change this file.
 */
import { TransactionType, FinanceTransaction, TransactionShare, SplitSharesEvent, FinanceSummary, Debt } from "./finance-types";

export function isTransactionType(obj: unknown): obj is TransactionType {
    const typedObj = obj as TransactionType
    return (
        (typedObj === "transfer" ||
            typedObj === "expense" ||
            typedObj === "income")
    )
}

export function isFinanceTransaction(obj: unknown): obj is FinanceTransaction {
    const typedObj = obj as FinanceTransaction
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["uuid"] === "string" &&
        typeof typedObj["title"] === "string" &&
        typeof typedObj["sender"] === "number" &&
        Array.isArray(typedObj["shares"]) &&
        typedObj["shares"].every((e: any) =>
            isTransactionShare(e) as boolean
        ) &&
        typeof typedObj["amount"] === "number" &&
        isTransactionType(typedObj["type"]) as boolean &&
        typeof typedObj["date"] === "string"
    )
}

export function isTransactionShare(obj: unknown): obj is TransactionShare {
    const typedObj = obj as TransactionShare
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["uuid"] === "string" &&
        typeof typedObj["userId"] === "number" &&
        typeof typedObj["share"] === "number"
    )
}

export function isSplitSharesEvent(obj: unknown): obj is SplitSharesEvent {
    const typedObj = obj as SplitSharesEvent
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        Array.isArray(typedObj["shares"]) &&
        typedObj["shares"].every((e: any) =>
            isTransactionShare(e) as boolean
        ) &&
        typeof typedObj["amount"] === "number"
    )
}

export function isFinanceSummary(obj: unknown): obj is FinanceSummary {
    const typedObj = obj as FinanceSummary
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["totalCosts"] === "number" &&
        typeof typedObj["yourCost"] === "number" &&
        typeof typedObj["yourIncome"] === "number" &&
        typeof typedObj["yourExpense"] === "number" &&
        Array.isArray(typedObj["debts"]) &&
        typedObj["debts"].every((e: any) =>
            isDebt(e) as boolean
        )
    )
}

export function isDebt(obj: unknown): obj is Debt {
    const typedObj = obj as Debt
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["fromUserId"] === "number" &&
        typeof typedObj["toUserId"] === "number" &&
        typeof typedObj["amount"] === "number"
    )
}
