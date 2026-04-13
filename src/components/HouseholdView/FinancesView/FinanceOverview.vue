<template>
  <IonSpinner
    v-if="financeSummary === undefined"
    class="center"
  />
  <ion-content v-else>
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{ _t('Finance overview') }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div class="row">
          <p>
            {{ _t('Sum of costs:') }}
          </p>
          <p>
            {{ formatMoney(financeSummary.totalCosts) }}
          </p>
        </div>
        <div class="row">
          <p>
            {{ _t('Your costs:') }}
          </p>
          <p>
            {{ formatMoney(financeSummary.yourCost) }}
          </p>
        </div>
        <div class="row">
          <p>
            {{ _t('You paid:') }}
          </p>
          <p>
            {{ formatMoney(financeSummary.yourExpense) }}
          </p>
        </div>
        <div class="row">
          <p>
            {{ _t('You received:') }}
          </p>
          <p>
            {{ formatMoney(financeSummary.yourIncome) }}
          </p>
        </div>
      </ion-card-content>
    </ion-card>
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{ _t('Debts') }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div
          v-for="debt in financeSummary.debts"
          :key="debt.fromUserId + '-' + debt.toUserId"
          class="row"
        >
          <p class="center-row">
            <WalletIcon />
            {{ formatOweString(debt) }}
          </p>
          <ion-button
            size="small"
            fill="outline"
            @click="settleUp(debt)"
          >
            <HeartHandshakeIcon slot="start" />
            <span class="pl-2">{{ _t('Settle up') }}</span>
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>
    <ion-refresher
      slot="fixed"
      @ionRefresh="fetchFinanceSummary($event)"
    >
      <ion-refresher-content />
    </ion-refresher>
  </ion-content>
</template>

<script setup lang="ts">
import { WalletIcon, HeartHandshakeIcon } from "vue-tabler-icons";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner
} from "@ionic/vue";
import { __t, _t } from "@/translation";
import { householdClientSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import { computed, inject } from "vue";
import { Debt, FinanceTransaction, formatMoney, userName } from "@/components/HouseholdView/FinancesView/finance-types";
import { fetchFinanceSummary } from "@/components/HouseholdView/FinancesView/finance-data-refresher";
import { uuid4 } from "@/common/uuid";
import { confirmablePrompt } from "@/alert/prompt";
import { error, showThrownError, success } from "@/toast";

const store = inject(storeSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const financeSummary = computed(() => {
  if (store.state.viewedHousehold === null) {
    return undefined;
  }
  return store.state.financeSummaries[store.state.viewedHousehold];
})

async function settleUp(debt: Debt) {
  const householdId = store.state.viewedHousehold;
  if (householdId === null) {
    await error(_t('No household selected, cannot settle debt.'));
    return;
  }
  const confirmMessage = (debt.fromUserId === store.state.user?.id || debt.toUserId === store.state.user?.id
      ? __t(
        'Do you want to settle the debt between you and {0} for {1}?',
        debt.fromUserId === store.state.user?.id ? userName(debt.toUserId) : userName(debt.fromUserId),
        formatMoney(debt.amount),
      )
      : __t(
        'Do you want to settle the debt between {0} and {1} for {2}?',
        userName(debt.fromUserId),
        userName(debt.toUserId),
        formatMoney(debt.amount),
      )
  );
  if (await confirmablePrompt(confirmMessage, _t('Settle debt'))) {
    const settlingTransaction: FinanceTransaction = {
      uuid: uuid4(),
      title: _t('Debt settlement'),
      sender: debt.fromUserId,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      amount: debt.amount,
      type: 'transfer',
      shares: [
        {
          userId: debt.toUserId,
          share: 1,
          uuid: uuid4(),
        },
      ],
    };
    try {
      await householdClient.addTransaction(householdId, settlingTransaction);
      store.addTransaction(householdId, settlingTransaction);
      void success(_t('Debt settled successfully.'));
      await fetchFinanceSummary();
    } catch (e) {
      void showThrownError(e);
    }
  }
}

function formatOweString(debt: Debt) {
  if (debt.fromUserId === store.state.user?.id) {
    return __t('You owe {0} {1}', userName(debt.toUserId), formatMoney(debt.amount));
  }
  if (debt.toUserId === store.state.user?.id) {
    return __t('{0} owes you {1}', userName(debt.fromUserId), formatMoney(debt.amount));
  }
  return __t('{0} owes {1} {2}', userName(debt.fromUserId), userName(debt.toUserId), formatMoney(debt.amount));
}

void fetchFinanceSummary();
</script>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px;
  gap: 4px;
}
.center {
  position: fixed;
  top: 50%;
  left: 50%;
}

.pl-2 {
  padding-left: 4px;
}
.center-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
</style>