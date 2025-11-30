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
    <div class="row">
      <ion-label for="datetime-button">
        <div class="label-header">
          <UsersGroupIcon />
          {{ _t("How to split?") }}
        </div>
      </ion-label>
      <div class="button-row">
        <ion-button
          color="light"
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
          color="light"
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
  </ion-content>
</template>

<script setup lang="ts">
import { CalendarIcon, CheckIcon, ChevronDownIcon, CircleXIcon, UsersGroupIcon } from 'vue-tabler-icons';
import { _t } from '@/translation';
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
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
import { ComponentInstance, computed, inject, ref } from "vue";
import {
  getTransactionLabel,
  imgMap,
  isTransactionType,
  TransactionShare,
  TransactionType,
  userName
} from "@/components/HouseholdView/FinancesView/finance-types";
import SelectExpenseDialog from "@/components/HouseholdView/FinancesView/SelectExpenseDialog.vue";
import { OverlayEventDetail } from "@ionic/core";
import { gettersSymbol, stateSymbol } from "@/dependency-injection/injection-keys";
import { UserId } from "@/types";
import { randomIndex } from "@/common/random";
import CurrencyInput from "@/common/CurrencyInput.vue";
import SplitSharesSettingsDialog from "@/components/HouseholdView/FinancesView/SplitSharesSettingsDialog.vue";

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
  console.log("every bug", shares.value);
  return shares.value.every((share) => share.share === 1)
    && shares.value.length === members.value.length
    && members.value.every(
      (member) => shares.value.some((share) => member.id === share.userId)
    );
});

const emit = defineEmits(['select']);

async function dismiss() {
  await modalController.dismiss();
}

async function _select(icon: string) {
  props.resultReceiver.dispatchEvent(new CustomEvent('icon', {detail: icon}));
  emit('select', icon);
  await dismiss();
}

function selectShares(newShares: TransactionShare[]) {
  console.error("Not supported yet", "selectShares", newShares);
  //shares.value = newShares;
}

function selectTransferType(event: CustomEvent<OverlayEventDetail>) {
  if (isTransactionType(event.detail.data)) {
    transactionType.value = event.detail.data;
  } else {
    console.warn("Selecting transfertype failed", event.detail);
  }
}

function splitEquallyBetweenEveryone() {
  shares.value = members.value.map((member) => ({
    userId: member.id,
    share: 1,
  }));
}

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
</style>
