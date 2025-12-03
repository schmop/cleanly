<template>
  <IonSpinner
    v-if="isLoading && transactions.length === 0"
    class="center"
  />
  <ion-content>
    <FinanceTransactionRender
      v-for="transaction in transactions"
      :key="transaction.uuid"
      :transaction="transaction"
    />
    <ion-refresher
      slot="fixed"
      @ionRefresh="loadTransactions($event)"
    >
      <ion-refresher-content />
    </ion-refresher>
  </ion-content>
</template>

<script setup lang="ts">
import FinanceTransactionRender from "@/components/HouseholdView/FinancesView/FinanceTransactionRender.vue";
import { IonContent, IonRefresher, IonRefresherContent, IonSpinner, RefresherCustomEvent } from "@ionic/vue";
import { computed, inject, ref } from "vue";
import { householdClientSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import { error } from "@/toast";

const householdClient = inject(householdClientSymbol)!;
const store = inject(storeSymbol)!;

const isLoading = ref(true);

const transactions = computed(() => {
  if (store.state.viewedHousehold === null) {
    return [];
  }
  const financeTransactions = store.state.financeTransactions[store.state.viewedHousehold];

  return financeTransactions ?? [];
});

async function loadTransactions(event?: RefresherCustomEvent) {
  isLoading.value = true;
  if (store.state.viewedHousehold !== null) {
    try {
      store.setTransactions(
        store.state.viewedHousehold,
        await householdClient.getTransactions(store.state.viewedHousehold),
      );
    } catch (err) {
      void error('Could not load transactions!');
      console.error(err);
    }
  } else {
    void error('Could not load transactions, no household selected!');
  }
  if (event != null) {
    await event.target.complete();
  }
  isLoading.value = false;
}

void loadTransactions();

</script>

<style scoped>
.center {
  position: fixed;
  top: 50%;
  left: 50%;
}
</style>