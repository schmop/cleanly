<template>
  <ion-page>
    <ion-toolbar class="pt-2">
      <ion-segment
        :value="financeView"
        @ionChange="changeView"
      >
        <ion-segment-button value="overview">
          <ActivityIcon />
          <ion-label>
            {{ _t('Finance overview') }}
          </ion-label>
        </ion-segment-button>
        <ion-segment-button value="expenses">
          <ChartPieIcon />
          <ion-label>
            {{ _t('Expenses') }}
          </ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-toolbar>
    <ion-content>
      <FinanceOverview v-if="financeView === 'overview'" />
      <ExpensesView v-else-if="financeView === 'expenses'" />
      <ion-fab
        slot="fixed"
        vertical="bottom"
        horizontal="end"
      >
        <ion-fab-button @click="openAddExpenseModal">
          <PlusIcon />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonFab,
  IonFabButton,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
  IonContent,
  modalController,
  SegmentChangeEventDetail
} from "@ionic/vue";
import { ActivityIcon, ChartPieIcon, PlusIcon } from "vue-tabler-icons";
import { _t } from "@/translation";
import { inject, ref } from "vue";
import { IonSegmentCustomEvent } from "@ionic/core";
import FinanceOverview from "@/components/HouseholdView/FinancesView/FinanceOverview.vue";
import ExpensesView from "@/components/HouseholdView/FinancesView/ExpensesView.vue";
import AddExpenseModal from "@/modals/AddExpenseModal.vue";
import { isFinanceTransaction } from "@/components/HouseholdView/FinancesView/finance-types.guard";
import { householdClientSymbol, stateSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import { error, showThrownError, success } from "@/toast";

type FinanceView = 'overview' | 'expenses';
function isFinanceView(value: any): value is FinanceView {
  return value === 'overview' || value === 'expenses';
}

const householdClient = inject(householdClientSymbol)!;
const store = inject(storeSymbol)!;
const state = inject(stateSymbol)!;

const financeView = ref<FinanceView>('overview');

function changeView(event: IonSegmentCustomEvent<SegmentChangeEventDetail>) {
  if (!isFinanceView(event.detail.value)) {
    return;
  }
  financeView.value = event.detail.value;
}

async function openAddExpenseModal() {
  const resultReceiver = new EventTarget();
  let receivedEvent: unknown = null;
  resultReceiver.addEventListener('select', (event) => {
    receivedEvent = event;
  });
  const addExpenseModal = await modalController.create({
    component: AddExpenseModal,
    componentProps: {
      resultReceiver,
    }
  });
  await addExpenseModal.present();
  await addExpenseModal.onDidDismiss();

  if (!(receivedEvent instanceof CustomEvent)) {
    return;
  }
  if (!isFinanceTransaction(receivedEvent.detail)) {
    void error('Add Expense - Invalid transaction received:', receivedEvent.detail);
    return;
  }
  if (null === state.viewedHousehold) {
    void error('Add Expense - No household selected!');
    return;
  }
  const transaction = receivedEvent.detail;
  const householdId = state.viewedHousehold;
  householdClient.addTransaction(householdId, transaction)
    .then(() => {
      store.addTransaction(householdId, transaction);
      void success(_t('Transaction added successfully'));
    })
    .catch((err) => void showThrownError(err, 'adding expense'));
}


</script>

<style scoped>
.pt-2 {
  padding-top: 8px;
}
</style>
