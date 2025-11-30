import { UserId } from "@/types";
import { Uuid } from "@/common/uuid";
import { computed, inject } from "vue";
import { gettersSymbol, stateSymbol } from "@/dependency-injection/injection-keys";
import { _t } from "@/translation";
import transferImg from '@img/transfer.png';
import expenseImg from '@img/expense.png';
import incomeImg from '@img/income.png';

export type TransactionType = "transfer" | "expense" | "income";

export function isTransactionType(value: any): value is TransactionType {
    return value === "expense" || value === "income" || value === "transfer";
}

export const imgMap: Record<TransactionType, string> = {
    transfer: transferImg,
    expense: expenseImg,
    income: incomeImg,
};
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
export const CURRENCY = "€";
export const CURRENCY_CODE = "EUR";

export type FinanceTransaction = {
    uuid: Uuid,
    title: string,
    sender: UserId
    shares: TransactionShare[],
    amount: number, // number in cents
    type: TransactionType,
    date: Date,
};

export type TransactionShare = {
    userId: UserId,
    share: number,
};

export function userName(userId: UserId): string {
    const state = inject(stateSymbol);
    if (userId === state?.user?.id) {
        return _t('You');
    }
    const getters = inject(gettersSymbol);
    const household = computed(() => getters?.household.value);

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