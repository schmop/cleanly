<template>
  <ion-modal ref="modal">
    <ion-header>
      <ion-toolbar color="medium">
        <ion-title>
          {{ _t('Split shares') }}
          <CircleXIcon
            style="float: right"
            @click="dismiss()"
          />
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list
        lines="none"
        class="p gap"
      >
        <CurrencyInput
          v-model="_amount"
          label="Split this amount"
        />
        <ion-item>
          <ion-toolbar class="pt-2">
            <ion-segment
              :value="splitType"
              @ionChange="selectSplitType"
            >
              <ion-segment-button
                value="equally"
              >
                <EqualIcon />
                <ion-label>
                  {{ _t('Equally') }}
                </ion-label>
              </ion-segment-button>
              <ion-segment-button
                value="amount"
              >
                <NumbersIcon />
                <ion-label>
                  {{ _t('Amount') }}
                </ion-label>
              </ion-segment-button>
              <ion-segment-button
                value="shares"
              >
                <ChartPie4Icon />
                <ion-label>
                  {{ _t('Shares') }}
                </ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-toolbar>
        </ion-item>
        <ion-item>
          <ion-label class="fixed-height">
            <h2>
              {{ splitTitle }}
            </h2>
            <p>
              {{ splitDescription }}
            </p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-checkbox
            label-placement="end"
            :checked="allIncluded"
            @ionChange="toggleAll"
          >
            {{ _t('All') }}
          </ion-checkbox>
        </ion-item>
        <ion-item
          v-for="share in shares"
          :key="share.memberId"
          class="overflow-visible"
        >
          <ion-checkbox
            v-model="share.include"
            label-placement="end"
          >
            {{ userName(share.memberId) }}
          </ion-checkbox>
          <template v-if="splitType === 'amount' && share.include">
            <CircleXIcon
              v-if="share.amountSet"
              @click.stop="resetShare(share)"
            />
            <CurrencyInput
              v-model="share.amount"
              class="smol"
              :disabled="!share.include"
              :label="_t('Amount')"
              @keydown="onInput(share)"
              @click.stop
            />
          </template>
          <template v-if="splitType === 'shares' && share.include">
            <div class="float-right">
              {{ formatMoney(share.amount) }} =
            </div>
            <ion-input
              :model-value="share.shares"
              label-placement="stacked"
              fill="outline"
              type="number"
              class="ion-input-smol"
              :disabled="!share.include"
              :label="_t('Shares')"
              @update:modelValue="setShare(share, parseInt($event, 10))"
              @keydown="onInput(share)"
              @click.stop
            />
          </template>
          <template v-if="splitType === 'equally' && share.include">
            <div class="float-right">
              {{ formatMoney(share.amount) }}
            </div>
          </template>
        </ion-item>
        <ion-item
          v-if="sharesInvalidReason !== null"
          color="danger"
        >
          <p>{{ sharesInvalidReason }}</p>
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-button
          slot="start"
          color="primary"
          :disabled="sharesInvalidReason !== null"
          @click="finalizeShares()"
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
  </ion-modal>
</template>

<script setup lang="ts">
import { ChartPie4Icon, CirclePlusIcon, CircleXIcon, EqualIcon, NumbersIcon } from 'vue-tabler-icons';
import {
  CheckboxChangeEventDetail,
  CheckboxCustomEvent,
  IonButton,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  modalController,
  SegmentChangeEventDetail
} from '@ionic/vue';
import { formatMoney, SplitSharesEvent, userName } from "@/components/HouseholdView/FinancesView/finance-types";
import { ComponentInstance, computed, ref, watch } from "vue";
import CurrencyInput from "@/common/CurrencyInput.vue";
import { _t } from "@/translation";
import { IonSegmentCustomEvent } from "@ionic/core";
import { UserId } from "@/types";
import { User } from "@/models/User";
import { floor } from "@/common/math";
import { uuid4 } from "@/common/uuid";

type WorkInProgressShare = {
  memberId: UserId;
  include: boolean;
  amountSet: boolean;
  amount: number;
  shares: number;
};

type SplitType = 'equally' | 'amount' | 'shares';

const modal = ref<ComponentInstance<typeof IonModal>>();
const props = defineProps<{
  amount: number;
  members: User[];
}>();
const splitType = ref<SplitType>('equally');
const shares = ref<WorkInProgressShare[]>([]);
const _amount = ref<number>(props.amount);

const splitTitle = computed(() => {
  switch (splitType.value) {
    case 'equally':
      return _t('Split equally');
    case 'amount':
      return _t('Split by exact amounts');
    case 'shares':
      return _t('Split by shares');
  }
  return "undefined split type";
});

const splitDescription = computed(() => {
  switch (splitType.value) {
    case 'equally':
      return _t('Select who owes an equal share.');
    case 'amount':
      return _t('Enter the exact amount each participant owes.');
    case 'shares':
      return _t('Enter the shares for each participant, e.g. nights stayed or items consumed.');
  }
  return "undefined split type";
});

const allIncluded = computed(() => {
  return shares.value.every(share => share.include);
});

const sharesInvalidReason = computed(() => {
  if (shares.value.every(share => !share.include)) {
    return _t('At least one participant must be included.');
  }
  if (shares.value.filter(share => share.include).some(share => share.amount < 0)) {
    return _t('Amounts cannot be negative.');
  }
  if (splitType.value === 'amount') {
    const total = shares.value.reduce((sum, share) => {
      return sum + (share.include ? share.amount : 0);
    }, 0);
    if (total !== _amount.value) {
      return _t('The total of all amounts must equal the split amount.');
    }
  }
  return null;
});

function toggleAll(event: CheckboxCustomEvent<CheckboxChangeEventDetail<boolean>>) {
  const targetState = !allIncluded.value;
  for (const share of shares.value) {
    share.include = targetState;
  }
  event.detail.checked = targetState;
}

async function dismiss() {
  await modalController.dismiss();
}

function isSplitType(value: unknown): value is SplitType {
  return value === 'equally' || value === 'amount' || value === 'shares';
}

function selectSplitType(event: IonSegmentCustomEvent<SegmentChangeEventDetail>) {
  if (!isSplitType(event.detail.value)) {
    return;
  }
  splitType.value = event.detail.value;
  for (const share of shares.value) {
    share.shares = 1;
    share.amountSet = false;
  }
}

function setShare(share: WorkInProgressShare, newShares: number) {
  if (isNaN(newShares) || newShares < 1) {
    share.shares = 1;
  } else {
    share.shares = newShares;
  }
}

function initShares() {
  shares.value = props.members.map((member) => ({
    amountSet: false,
    include: true,
    amount: 0,
    shares: 1,
    memberId: member.id
  }));
}

function onInput(share: WorkInProgressShare) {
  share.amountSet = true;
}

function resetShare(share: WorkInProgressShare) {
  share.amount = 0;
  share.shares = 1;
  share.amountSet = false;
}

function updateSharesEqually() {
  for (const share of shares.value) {
    if (share.include) {
      share.amount = Math.max(1, floor(_amount.value / shares.value.filter(s => s.include).length));
    }
  }
}

function updateAmountByShares() {
  const totalShares = shares.value.reduce((sum, share) => {
    return sum + (share.include ? share.shares : 0);
  }, 0);
  for (const share of shares.value) {
    if (share.include) {
      share.amount = Math.max(1, floor((_amount.value * share.shares) / totalShares));
    }
  }
}

function updateNonFixedAmounts() {
  const predefinedAmount = shares.value.reduce((sum, share) => {
    return sum + (share.include && share.amountSet ? share.amount : 0);
  }, 0);
  const remainingAmount = _amount.value - predefinedAmount;
  const remainingPersons = shares.value.filter(share => share.include && !share.amountSet).length;
  const remainingAmountPerPerson = remainingAmount / remainingPersons;
  for (const share of shares.value) {
    if (share.include && !share.amountSet) {
      share.amount = remainingAmountPerPerson;
    }
  }
}

function updateShares() {
  switch (splitType.value) {
    case 'equally':
      updateSharesEqually();
      break;
    case 'shares':
      updateAmountByShares();
      break;
    case 'amount':
      updateNonFixedAmounts();
      break;
  }
}

function finalizeShares() {
  const sharesResult: SplitSharesEvent = {
    shares: shares.value.filter(share => share.include).map(share => ({
      userId: share.memberId,
      share: share.amount,
      uuid: uuid4(),
    })),
    amount: _amount.value,
  };
  modal.value?.$el.dismiss(sharesResult, 'select');
}

watch([shares, _amount, splitType], () => {
  updateShares();
}, {deep: true});

watch(() => props.amount, (newAmount) => {
  // This modal is mounted way before it is presented, so we need to watch for changes
  _amount.value = newAmount;
}, {immediate: true});

initShares();
</script>

<style scoped>
.p {
  padding: 2em 8px 8px;
}
.gap {
  gap: 8px;
  display: flex;
  flex-direction: column;
}
.smol {
  width: 100px;
  height: 48px;
}
.ion-input-smol {
  width: 100px;
  height: 44px;
  min-height: 44px;
}
.overflow-visible {
  overflow: visible;
}
.fixed-height {
  height: 4em;
}
.float-right {
  float:right;
  display:inline-block;
}
</style>