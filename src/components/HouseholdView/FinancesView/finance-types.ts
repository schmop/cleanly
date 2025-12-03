import { ISODateString, UserId } from "@/types";
import { Uuid } from "@/common/uuid";
import { computed } from "vue";
import { _t } from "@/translation";
import transferImg from '@img/transfer.png';
import expenseImg from '@img/expense.png';
import incomeImg from '@img/income.png';
import { store } from "@/store";

/**
 * @see {isTransactionType} ts-auto-guard:type-guard
 */
export type TransactionType = "transfer" | "expense" | "income";

export const imgMap: Record<TransactionType, string> = {
    transfer: transferImg,
    expense: expenseImg,
    income: incomeImg,
};
export const CURRENCY = "€";
export const CURRENCY_CODE = "EUR";

/** @see {isFinanceTransaction} ts-auto-guard:type-guard */
export type FinanceTransaction = {
    uuid: Uuid,
    title: string,
    sender: UserId
    shares: TransactionShare[],
    amount: number, // number in cents
    type: TransactionType,
    date: ISODateString,
};

/** @see {isTransactionShare} ts-auto-guard:type-guard */
export type TransactionShare = {
    uuid: Uuid,
    userId: UserId,
    share: number,
};

/** @see {isSplitSharesEvent} ts-auto-guard:type-guard */
export type SplitSharesEvent = {
    shares: TransactionShare[];
    amount: number;
}

/** @see {isFinanceSummary} ts-auto-guard:type-guard */
export type FinanceSummary = {
    totalCosts: number;
    yourCost: number;
    yourIncome: number;
    yourExpense: number;
    debts: Debt[];
}

/** @see {isDebt} ts-auto-guard:type-guard */
export type Debt = {
    fromUserId: UserId;
    toUserId: UserId;
    amount: number; // in cents
}

export function getTransactionLabel(type: TransactionType): string {
    if (type === 'transfer') {
        return _t('Transfer');
    }
    if (type === 'expense') {
        return _t('Expense');
    }
    if (type === 'income') {
        return _t('Income');
    }
    return 'Unsupported transaction type';
}

export function userName(userId: UserId): string {
    if (userId === store.state?.user?.id) {
        return _t('You');
    }
    const household = computed(() => store.getters.household.value);

    return household.value?.users.find(u => u.id === userId)?.name ?? _t("Unknown User");
}

export function formatMoney(amountInCents: number): string {
    const amountInEuros = amountInCents / 100;
    return amountInEuros.toLocaleString(undefined, {
        style: 'currency',
        currency: CURRENCY_CODE,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}