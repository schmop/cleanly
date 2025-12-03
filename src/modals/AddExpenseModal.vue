<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Add Transaction') }}
        <CircleXIcon
          style="float: right"
          @click="dismiss()"
        />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light">
    <div class="row">
      <ion-button
        id="open-transfer-type-selection-dialog"
        expand="full"
        color="medium"
      >
        <img
          slot="start"
          :src="imgMap[transactionType]"
          class="transaction-img"
          alt="Transfer"
        >
        <ion-label>
          {{ getTransactionLabel(transactionType) }}
        </ion-label>
        <ChevronDownIcon slot="end" />
      </ion-button>
      <SelectExpenseDialog
        trigger="open-transfer-type-selection-dialog"
        @willDismiss="selectTransferType"
      />
    </div>
    <div class="row">
      <ion-select
        v-model="sender"
        :label="senderLabel"
        label-placement="floating"
        interface="action-sheet"
        fill="outline"
      >
        <ion-select-option
          v-for="member in members"
          :key="member.id"
          :value="member.id"
        >
          {{ userName(member.id) }}
        </ion-select-option>
      </ion-select>
    </div>
    <div class="row">
      <ion-input
        v-model="title"
        :label="_t('What for?')"
        label-placement="floating"
        fill="outline"
      />
    </div>
    <div
      v-if="transactionType === 'transfer'"
      class="row"
    >
      <ion-select
        v-model="transferReceiver"
        :label="_t('Who received money?')"
        label-placement="floating"
        interface="action-sheet"
        fill="outline"
      >
        <ion-select-option
          v-for="member in members"
          :key="member.id"
          :value="member.id"
        >
          {{ userName(member.id) }}
        </ion-select-option>
      </ion-select>
    </div>
    <div class="row">
      <CurrencyInput
        ref="currencyInput"
        v-model="amount"
        label="How much?"
      />
    </div>
    <div class="row">
      <ion-label for="datetime-button">
        <div class="label-header">
          <CalendarIcon />
          {{ _t("When?") }}
        </div>
        <ion-datetime-button
          id="datetime-button"
          datetime="datetime"
        />
      </ion-label>

      <ion-modal
        ref="datetimeModal"
        :keep-contents-mounted="true"
      >
        <ion-datetime
          id="datetime"
          v-model="date"
          presentation="date"
          @ionChange="datetimeModal?.$el.dismiss()"
        />
      </ion-modal>
    </div>
    <div
      v-if="transactionType !== 'transfer'"
      class="row"
    >
      <ion-label for="datetime-button">
        <div class="label-header">
          <UsersGroupIcon />
          {{ _t("How to split?") }}
        </div>
      </ion-label>
      <div class="button-row">
        <ion-button
          :color="isEquallySplitBetweenEveryone ? 'tertiary' : 'light'"
          size="small"
          class="max-50"
          @click="splitEquallyBetweenEveryone"
        >
          <CheckIcon
            v-if="isEquallySplitBetweenEveryone"
            slot="start"
          />
          {{ _t('Equally between everyone') }}
        </ion-button>
        <ion-button
          id="open-split-shares-settings-dialog"
          :color="!isEquallySplitBetweenEveryone ? 'tertiary' : 'light'"
          size="small"
          class="max-50"
        >
          <CheckIcon
            v-if="!isEquallySplitBetweenEveryone"
            slot="start"
          />
          {{ _t('Equally between everyone') }}
          <ChevronDownIcon slot="end" />
        </ion-button>
        <SplitSharesSettingsDialog
          trigger="open-split-shares-settings-dialog"
          :members="members"
          :amount="amount"
          @willDismiss="selectShares"
        />
      </div>
    </div>
    <div class="row">
      <ion-label>
        <h2><CheckupListIcon /> {{ _t('Summary') }}</h2>
        <p
          v-if="transactionType === 'transfer'"
        >
          {{ transferSummary }}
        </p>
        <p
          v-for="summary in shareSummaries"
          v-else
          :key="summary.member.id"
          class="summary-row"
        >
          <span>{{ userName(summary.member.id) }}</span>
          <span>{{ formatMoney(summary.amount) }}</span>
        </p>
      </ion-label>
    </div>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button
        slot="start"
        color="primary"
        :disabled="!expenseValid"
        @click="finalizeExpense()"
      >
        <CirclePlusIcon slot="start" />
        {{ _t('Ok') }}
      </ion-button>
      <ion-button
        slot="end"
        color="light"
        @click="dismiss()"
      >
        <CircleXIcon slot="start" />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import {
  CalendarIcon,
  CheckIcon,
  CheckupListIcon,
  ChevronDownIcon,
  CirclePlusIcon,
  CircleXIcon,
  UsersGroupIcon
} from 'vue-tabler-icons';
import { __t, _t } from '@/translation';
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonFooter,
  IonHeader,
  IonInput,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { ComponentInstance, computed, inject, ref, watch } from "vue";
import {
  FinanceTransaction,
  formatMoney,
  getTransactionLabel,
  imgMap,
  SplitSharesEvent,
  TransactionShare,
  TransactionType,
  userName
} from "@/components/HouseholdView/FinancesView/finance-types";
import SelectExpenseDialog from "@/components/HouseholdView/FinancesView/SelectExpenseDialog.vue";
import { IonModalCustomEvent, OverlayEventDetail } from "@ionic/core";
import { gettersSymbol, stateSymbol } from "@/dependency-injection/injection-keys";
import { UserId } from "@/types";
import { randomIndex } from "@/common/random";
import CurrencyInput from "@/common/CurrencyInput.vue";
import SplitSharesSettingsDialog from "@/components/HouseholdView/FinancesView/SplitSharesSettingsDialog.vue";
import { floor } from "@/common/math";
import { isSplitSharesEvent, isTransactionType } from "@/components/HouseholdView/FinancesView/finance-types.guard";
import { uuid4 } from "@/common/uuid";

const state = inject(stateSymbol)!;
const getters = inject(gettersSymbol)!;

const props = defineProps<{
  resultReceiver: EventTarget,
}>();

const datetimeModal = ref<ComponentInstance<typeof IonModal>>();

const transactionType = ref<TransactionType>('expense');
const sender = ref<UserId>(state.user?.id ?? 0);
const transferReceiver = ref<UserId>(getters.household.value?.users.at(randomIndex(getters.household.value?.users.length ?? 0))?.id ?? 0);
const title = ref<string>("");
const amount = ref<number>(0);
const date = ref<string>((new Date()).toISOString());
const shares = ref<TransactionShare[]>([]);

const members = computed(() => {
  const myId = state.user?.id;
  const members = getters.household.value?.users ?? [];
  if (myId === null) {
    return members;
  }
  // sort "You" at the start
  return members.concat().sort((a, b) => {
    if (a.id === myId) {
      return -1;
    }
    if (b.id === myId) {
      return 1;
    }
    return 0;
  });
});
const senderLabel = computed(() => {
  if (transactionType.value === "expense") {
    return _t('Who paid?');
  }
  if (transactionType.value === "income") {
    return _t('Who received money?');
  }
  if (transactionType.value === "transfer") {
    return _t('Who gave money?');
  }
  return "Invalid transaction type";
});
const isEquallySplitBetweenEveryone = computed(() => {
  return shares.value.every((share) => share.share === 1)
    && shares.value.length === members.value.length
    && members.value.every(
      (member) => shares.value.some((share) => member.id === share.userId)
    );
});
const shareSummaries = computed(() => {
  const sumShares = shares.value.reduce((sum, share) => sum + share.share, 0);
  return members.value.map((member) => {
    const share = shares.value.find((share) => share.userId === member.id);
    return {
      member,
      amount: share ? floor(share.share * amount.value / sumShares) : 0,
    };
  });
});
const expenseValid = computed(() => {
  if (title.value.trim().length === 0) {
    return false;
  }
  if (amount.value <= 0) {
    return false;
  }
  if (shares.value.length === 0) {
    return false;
  }
  const totalShares = shares.value.reduce((sum, share) => sum + share.share, 0);

  return totalShares > 0;
});
const transferSummary = computed(() => {
  const receiverName = userName(transferReceiver.value);
  if (sender.value === state.user?.id) {
    return __t('You send {0} to {1}', formatMoney(amount.value), receiverName);
  }
  return __t('{0} sends {1} to {2}', userName(sender.value), formatMoney(amount.value), receiverName);
});

const emit = defineEmits(['select']);

async function dismiss() {
  await modalController.dismiss();
}

async function finalizeExpense() {
  const transaction: FinanceTransaction = {
    uuid: uuid4(),
    title: title.value,
    type: transactionType.value,
    amount: floor(amount.value),
    date: date.value,
    sender: sender.value,
    shares: shares.value,
  }
  props.resultReceiver.dispatchEvent(new CustomEvent('select', {detail: transaction}));
  emit('select', transaction);
  await dismiss();
}

function selectShares(event: IonModalCustomEvent<OverlayEventDetail<SplitSharesEvent>>) {
  if (event.detail.role !== 'select') {
    return; // probably canceled
  }
  if (!isSplitSharesEvent(event.detail.data)) {
    console.warn("Selecting shares failed", event.detail);
    return;
  }
  amount.value = event.detail.data.amount;
  shares.value = event.detail.data.shares;
}

function selectTransferType(event: CustomEvent<OverlayEventDetail>) {
  if (isTransactionType(event.detail.data)) {
    if (transactionType.value === "transfer" && event.detail.data !== "transfer") {
      splitEquallyBetweenEveryone();
    }
    transactionType.value = event.detail.data;
  } else {
    console.warn("Selecting transfertype failed", event.detail);
  }
}

function splitEquallyBetweenEveryone() {
  shares.value = members.value.map((member) => ({
    userId: member.id,
    share: 1,
    uuid: uuid4(),
  }));
}

watch([transferReceiver, transactionType], () => {
  if (transactionType.value === "transfer") {
    shares.value = [{
      userId: transferReceiver.value,
      share: 1,
      uuid: uuid4(),
    }];
  }
})

splitEquallyBetweenEveryone();
</script>

<style>
.transaction-img {
  width: 100px;
  padding: 8px;
}

.row {
  padding: 8px;
  margin-bottom: 8px;
}

.label-header {
  display: flex;
  flex-direction: row;
  align-items: end;
  gap: 8px;
}

.button-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: space-between;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-top: 8px !important;
}
</style>
