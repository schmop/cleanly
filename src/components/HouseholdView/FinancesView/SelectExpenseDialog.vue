<template>
  <ion-modal ref="modal">
    <ion-content>
      <ion-list lines="none">
        <ion-item
          :button="true"
          :detail="false"
          @click="select('expense')"
        >
          <img
            :src="expenseImg"
            class="transaction-img"
            :alt="_t('Expense')"
          >
          <ion-label>
            <h2>{{ _t("Expense") }}</h2>
            <p>{{ _t("Someone in your group paid for something outside of the group") }}</p>
          </ion-label>
        </ion-item>
        <ion-item
          :button="true"
          :detail="false"
          @click="select('income')"
        >
          <img
            :src="incomeImg"
            class="transaction-img"
            :alt="_t('Income')"
          >
          <ion-label>
            <h2>{{ _t("Income") }}</h2>
            <p>{{ _t("Someone in your group received money from outside of the group") }}</p>
          </ion-label>
        </ion-item>
        <ion-item
          :button="true"
          :detail="false"
          @click="select('transfer')"
        >
          <img
            :src="transferImg"
            class="transaction-img"
            :alt="_t('Transfer')"
          >
          <ion-label>
            <h2>{{ _t('Transfer') }}</h2>
            <p>{{ _t("Money was transferred between two group participants") }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {IonLabel, IonItem, IonModal, IonList, IonContent} from '@ionic/vue';
import transferImg from '@img/transfer.png';
import expenseImg from '@img/expense.png';
import incomeImg from '@img/income.png';
import { TransactionType } from "@/components/HouseholdView/FinancesView/finance-types";
import { _t } from "@/translation";
import { ComponentInstance, ref } from "vue";

const modal = ref<ComponentInstance<typeof IonModal>>();
function select(option: TransactionType) {
  modal.value?.$el.dismiss(option, 'select');
}
</script>

<style scoped>
</style>