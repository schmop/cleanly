/** @see {isPushNotificationTaskAction} ts-auto-guard:type-guard */
export type PushNotificationTaskAction = {
    type: 'task_done' | 'task_due' | 'task_assign',
    householdId: string,
    taskId: string,
}

/** @see {isPushNotificationChecklistUpdate} ts-auto-guard:type-guard */
export type PushNotificationChecklistUpdate = {
    type: 'checklist_update',
    householdId: string,
    checklistUuid: string,
}

/** @see {isPushNotificationFinanceTransaction} ts-auto-guard:type-guard */
export type PushNotificationFinanceTransaction = {
    type: 'finance_transaction',
    householdId: string,
    transactionUuid: string,
}

/** @see {isPushNotificationInvite} ts-auto-guard:type-guard */
export type PushNotificationInvite = {
    type: 'invite',
    householdId: string,
}

/** @see {isPushNotificationData} ts-auto-guard:type-guard */
export type PushNotificationData =
    | PushNotificationTaskAction
    | PushNotificationChecklistUpdate
    | PushNotificationFinanceTransaction
    | PushNotificationInvite
