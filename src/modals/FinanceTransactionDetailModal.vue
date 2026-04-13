<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>{{ transaction.title }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss()">
          <CircleXIcon />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light">
    <ion-list :inset="true">
      <ion-item lines="full">
        <img
          slot="start"
          :src="imgMap[transaction.type]"
          class="type-img"
          :alt="getTransactionLabel(transaction.type)"
        >
        <ion-label>{{ getTransactionLabel(transaction.type) }}</ion-label>
      </ion-item>
      <ion-item lines="full">
        <CashIcon slot="start" />
        <ion-label>
          <h2>{{ amountString }}</h2>
        </ion-label>
      </ion-item>
      <ion-item lines="full">
        <UserIcon slot="start" />
        <ion-label>{{ senderString }}</ion-label>
      </ion-item>
      <ion-item lines="none">
        <CalendarIcon slot="start" />
        <ion-label>{{ dateString }}</ion-label>
      </ion-item>
    </ion-list>
    <ion-list
      v-if="transaction.type !== 'transfer'"
      :inset="true"
    >
      <ion-list-header>
        <ion-label>{{ _t('Split') }}</ion-label>
      </ion-list-header>
      <ion-item
        v-for="share in shareDetails"
        :key="share.userId"
        lines="none"
      >
        <UsersIcon slot="start" />
        <ion-label>{{ userName(share.userId) }}</ion-label>
        <ion-note slot="end">
          {{ formatMoney(share.amount) }}
        </ion-note>
      </ion-item>
    </ion-list>
    <ion-list :inset="true">
      <ion-item lines="none">
        <ClockIcon slot="start" />
        <ion-label color="medium">
          {{ _t('Added') }}: {{ createdAtString }}
        </ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
  <ion-footer v-if="canDelete">
    <ion-toolbar>
      <ion-button
        slot="start"
        @click="edit()"
      >
        <PencilIcon slot="start" />
        {{ _t('Edit') }}
      </ion-button>
      <ion-button
        slot="end"
        color="danger"
        @click="doDelete()"
      >
        <TrashXIcon slot="start" />
        {{ _t('Delete') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToolbar,
  modalController,
} from '@ionic/vue';
import {
  CalendarIcon,
  CashIcon,
  CircleXIcon,
  ClockIcon,
  PencilIcon,
  TrashXIcon,
  UserIcon,
  UsersIcon,
} from 'vue-tabler-icons';
import { computed, inject } from 'vue';
import { householdClientSymbol, storeSymbol } from '@/dependency-injection/injection-keys';
import { _t } from '@/translation';
import {
  FinanceTransaction,
  formatMoney,
  getTransactionLabel,
  imgMap,
  userName,
} from '@/components/HouseholdView/FinancesView/finance-types';
import { formatDate } from '@/common/time';
import { confirmablePrompt } from '@/alert/prompt';
import { error, showThrownError, success } from '@/toast';
import { openExpenseFormModal } from '@/components/HouseholdView/FinancesView/finance-modal';

const store = inject(storeSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const props = defineProps<{ transaction: FinanceTransaction }>();

const amountString = computed(() => formatMoney(props.transaction.amount));
const dateString = computed(() => formatDate(new Date(props.transaction.date)));
const createdAtString = computed(() => formatDate(new Date(props.transaction.createdAt)));

const senderString = computed(() => {
  if (props.transaction.sender === store.state.user?.id) {
    return _t('You');
  }
  return userName(props.transaction.sender);
});

const shareDetails = computed(() => {
  const totalShares = props.transaction.shares.reduce((sum, s) => sum + s.share, 0);
  return props.transaction.shares.map(s => ({
    userId: s.userId,
    amount: Math.floor(s.share * props.transaction.amount / totalShares),
  }));
});

const canDelete = computed(() => {
  if (props.transaction.sender !== store.state.user?.id) {
    return false;
  }
  const diffInMs = new Date().getTime() - new Date(props.transaction.createdAt).getTime();
  return diffInMs <= 2 * 60 * 60 * 1000;
});

async function dismiss() {
  await modalController.dismiss();
}

async function edit() {
  await dismiss();
  await openExpenseFormModal(props.transaction);
}

async function doDelete() {
  if (!await confirmablePrompt(_t('Are you sure you want to delete this transaction?'), _t('Delete Transaction'))) {
    return;
  }
  const householdId = store.state.viewedHousehold;
  if (householdId === null) {
    await error(_t('No household selected, cannot delete transaction.'));
    return;
  }
  try {
    await householdClient.deleteTransaction(householdId, props.transaction);
    store.removeTransaction(householdId, props.transaction.uuid);
    await dismiss();
    void success(_t('Transaction deleted successfully.'));
  } catch (err) {
    void showThrownError(err, 'deleting transaction');
  }
}
</script>

<style scoped>
.type-img {
  width: 48px;
  padding: 8px;
}
</style>
