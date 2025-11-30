<template>
  <ion-card :class="{'cash-disbursements': !isCashTaking, 'cash-taking': isCashTaking }">
    <div class="row padding">
      <div class="align-left">
        <ion-card-title>{{ transaction.title }}</ion-card-title>
        <ion-card-subtitle class="m-1">
          {{ whoPaidString }}
        </ion-card-subtitle>
        <ion-card-subtitle v-if="receiverString !== null">
          <UsersIcon />{{ receiverString }}
        </ion-card-subtitle>
        <ion-card-subtitle><CalendarIcon />{{ dateString }}</ion-card-subtitle>
      </div>
      <div class="align-right">
        <ion-card-title>
          <ion-text :color="isCashTaking ? 'success' : 'danger'">
            {{ amountString }}
          </ion-text>
        </ion-card-title>
      </div>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardSubtitle, IonCardTitle, IonText } from '@ionic/vue'
import { CalendarIcon, UsersIcon } from 'vue-tabler-icons';
import { computed, inject } from "vue";
import { storeSymbol } from "@/dependency-injection/injection-keys";
import { __t, _t } from "@/translation";
import { CURRENCY, FinanceTransaction, userName } from "@/components/HouseholdView/FinancesView/finance-types";
import { formatDate } from "@/common/time";

const store = inject(storeSymbol)!;

const props = defineProps<{transaction: FinanceTransaction}>();

const isCashTaking = computed(() => {
  switch (props.transaction.type) {
    case "expense":
      return false;
    case "transfer": // when I am a receiver of a transfer, mark it green
      return props.transaction.shares.some(receiver => receiver.userId === store.state.user?.id);
    case "income":
      return true;
  }
  return false;
});
const amountString = computed(() => `${isCashTaking.value ? '':'-'}${props.transaction.amount.toFixed(2)}${CURRENCY}`);
const whoPaidString = computed(() => {
  if (props.transaction.type === "transfer") {
    const receiver = props.transaction.shares[0];
    if (null == receiver) {
      return __t('{0} settled with no one', userName(props.transaction.sender));
    }
    return __t('{0} gave to {1}', userName(props.transaction.sender), userName(receiver.userId));
  }
  return __t('Paid by {0}', userName(props.transaction.sender));
});

const receiverString = computed(() => {
  const firstReceiver = props.transaction.shares[0];
  if (props.transaction.type === "transfer" || !firstReceiver) {
    return null;
  }
  if (props.transaction.shares.length === 1) {
    return userName(firstReceiver.userId);
  }
  const householdMembers = store.getters.household.value?.users ?? [];
  const notParticipatingMembers = householdMembers.filter(member =>
    !props.transaction.shares.some(receiver => receiver.userId === member.id)
  );
  if (notParticipatingMembers.length === 0) {
    return _t('Everyone');
  }
  if (notParticipatingMembers.length === 1) {
    return __t('Everyone except {0}', userName(notParticipatingMembers[0]!.id));
  }
  return props.transaction.shares.map((share) => userName(share.userId)).join(', ');
});
const dateString = computed(() => {
  return formatDate(props.transaction.date);
});
</script>

<style scoped>
.row {
  display: flex;
  gap: 16px; /* Space between cards */
  justify-content: space-between;
}

.align-left {
  text-align: left;
}


.align-right {
  text-align: right;
}

.padding {
  padding: 16px;
}

.m-1 {
  margin: 8px 0;
}

.cash-disbursements {
  --background: rgb(237, 187, 187);
  @media (prefers-color-scheme: dark) {
    --background: rgb(38, 13, 13);
  }
}


.cash-taking {
  --background: rgb(191, 232, 191);
  @media (prefers-color-scheme: dark) {
    --background: rgb(13, 38, 13);
  }
}

ion-card-subtitle {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>