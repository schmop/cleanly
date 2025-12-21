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
        <ion-fab-button @click="openExpenseFormModal()">
          <PlusIcon />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
  SegmentChangeEventDetail
} from "@ionic/vue";
import { ActivityIcon, ChartPieIcon, PlusIcon } from "vue-tabler-icons";
import { _t } from "@/translation";
import { ref } from "vue";
import { IonSegmentCustomEvent } from "@ionic/core";
import FinanceOverview from "@/components/HouseholdView/FinancesView/FinanceOverview.vue";
import ExpensesView from "@/components/HouseholdView/FinancesView/ExpensesView.vue";
import { openExpenseFormModal } from "@/components/HouseholdView/FinancesView/finance-modal";

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


</script>

<style scoped>
.pt-2 {
  padding-top: 8px;
}
</style>
