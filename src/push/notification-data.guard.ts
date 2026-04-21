/*
 * Generated type guards for "notification-data.ts".
 * WARNING: Do not manually change this file.
 */
import { PushNotificationTaskAction, PushNotificationChecklistUpdate, PushNotificationFinanceTransaction, PushNotificationInvite, PushNotificationData } from "./notification-data";

export function isPushNotificationTaskAction(obj: unknown): obj is PushNotificationTaskAction {
    const typedObj = obj as PushNotificationTaskAction
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === "task_done" ||
            typedObj["type"] === "task_due" ||
            typedObj["type"] === "task_assign") &&
        typeof typedObj["householdId"] === "string" &&
        typeof typedObj["taskId"] === "string"
    )
}

export function isPushNotificationChecklistUpdate(obj: unknown): obj is PushNotificationChecklistUpdate {
    const typedObj = obj as PushNotificationChecklistUpdate
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "checklist_update" &&
        typeof typedObj["householdId"] === "string" &&
        typeof typedObj["checklistUuid"] === "string"
    )
}

export function isPushNotificationFinanceTransaction(obj: unknown): obj is PushNotificationFinanceTransaction {
    const typedObj = obj as PushNotificationFinanceTransaction
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "finance_transaction" &&
        typeof typedObj["householdId"] === "string" &&
        typeof typedObj["transactionUuid"] === "string"
    )
}

export function isPushNotificationInvite(obj: unknown): obj is PushNotificationInvite {
    const typedObj = obj as PushNotificationInvite
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "invite" &&
        typeof typedObj["householdId"] === "string"
    )
}

export function isPushNotificationData(obj: unknown): obj is PushNotificationData {
    const typedObj = obj as PushNotificationData
    return (
        (isPushNotificationTaskAction(typedObj) as boolean ||
            isPushNotificationChecklistUpdate(typedObj) as boolean ||
            isPushNotificationFinanceTransaction(typedObj) as boolean ||
            isPushNotificationInvite(typedObj) as boolean)
    )
}
