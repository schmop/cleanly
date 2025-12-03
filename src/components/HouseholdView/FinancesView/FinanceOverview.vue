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
import { WalletIcon } from "vue-tabler-icons";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  RefresherCustomEvent
} from "@ionic/vue";
import { __t, _t } from "@/translation";
import { householdClientSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import { computed, inject } from "vue";
import { Debt, formatMoney, userName } from "@/components/HouseholdView/FinancesView/finance-types";
import { error, showThrownError } from "@/toast";

const store = inject(storeSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const financeSummary = computed(() => {
  if (store.state.viewedHousehold === null) {
    return undefined;
  }
  return store.state.financeSummaries[store.state.viewedHousehold];
})

function formatOweString(debt: Debt) {
  if (debt.fromUserId === store.state.user?.id) {
    return __t('You owe {0} {1}', userName(debt.toUserId), formatMoney(debt.amount));
  }
  if (debt.toUserId === store.state.user?.id) {
    return __t('{0} owes you {1}', userName(debt.fromUserId), formatMoney(debt.amount));
  }
  return __t('{0} owes {1} {2}', userName(debt.fromUserId), userName(debt.toUserId), formatMoney(debt.amount));
}

async function fetchFinanceSummary(event?: RefresherCustomEvent) {
  if (store.state.viewedHousehold === null) {
    void error('Could not fetch finance summary, no household selected!');
    return;
  }
  try {
    store.setFinanceSummary(
      store.state.viewedHousehold,
      await householdClient.fetchFinanceSummary(store.state.viewedHousehold),
    );
  } catch (err) {
    void showThrownError(err, 'fetching the finance summary');
  }
  if (event != null) {
    await event.target.complete();
  }
}

void fetchFinanceSummary();
</script>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px;
}
.center {
  position: fixed;
  top: 50%;
  left: 50%;
}
.center-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
</style>