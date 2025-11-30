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
  modalController,
  SegmentChangeEventDetail
} from "@ionic/vue";
import { ActivityIcon, ChartPieIcon, PlusIcon } from "vue-tabler-icons";
import { _t } from "@/translation";
import { ref } from "vue";
import { IonSegmentCustomEvent } from "@ionic/core";
import FinanceOverview from "@/components/HouseholdView/FinancesView/FinanceOverview.vue";
import ExpensesView from "@/components/HouseholdView/FinancesView/ExpensesView.vue";
import AddExpenseModal from "@/modals/AddExpenseModal.vue";

type FinanceView = 'overview' | 'expenses';
function isFinanceView(value: any): value is FinanceView {
  return value === 'overview' || value === 'expenses';
}

const financeView = ref<FinanceView>('overview');

function changeView(event: IonSegmentCustomEvent<SegmentChangeEventDetail>) {
  if (!isFinanceView(event.detail.value)) {
    return;
  }
  financeView.value = event.detail.value;
}

async function openAddExpenseModal() {
  const resultReceiver = new EventTarget();
  resultReceiver.addEventListener('result', (event) => {
    console.log('Expense added:', (event as CustomEvent<any>).detail);
  });
  const iconPicker = await modalController.create({
    component: AddExpenseModal,
    componentProps: {
      resultReceiver,
    }
  });
  await iconPicker.present();
  await iconPicker.onDidDismiss();
  console.log("Finished");
}


</script>

<style scoped>
.pt-2 {
  padding-top: 8px;
}
</style>
