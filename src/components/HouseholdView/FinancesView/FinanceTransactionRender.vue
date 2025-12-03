<template>
  <ion-card :class="transaction.type">
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
          {{ amountString }}
        </ion-card-title>
        <ion-card-subtitle
          v-if="yourShareString !== null"
          class="m-1"
        >
          {{ yourShareString }}
        </ion-card-subtitle>
      </div>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardSubtitle, IonCardTitle } from '@ionic/vue'
import { CalendarIcon, UsersIcon } from 'vue-tabler-icons';
import { computed, inject } from "vue";
import { storeSymbol } from "@/dependency-injection/injection-keys";
import { __t, _t } from "@/translation";
import { FinanceTransaction, formatMoney, userName } from "@/components/HouseholdView/FinancesView/finance-types";
import { formatDate } from "@/common/time";

const store = inject(storeSymbol)!;

const props = defineProps<{transaction: FinanceTransaction}>();

const amountString = computed(() => formatMoney(props.transaction.amount));
const whoPaidString = computed(() => {
  const myId = store.state.user?.id;
  if (props.transaction.type === "transfer") {
    const share = props.transaction.shares[0];
    if (null == share) {
      return __t('{0} gave no one money', userName(props.transaction.sender));
    }
    if (share.userId === myId) {
      return __t('{0} gave you money', userName(props.transaction.sender));
    }
    if (props.transaction.sender === myId) {
      return __t('You gave {0} money', userName(share.userId));
    }
    return __t('{0} gave to {1}', userName(props.transaction.sender), userName(share.userId));
  }
  if (props.transaction.type === 'income') {
    if (props.transaction.sender === myId) {
      return _t('You received money');
    }
    return __t('Received by {0}', userName(props.transaction.sender));
  }
  if (props.transaction.sender === myId) {
    return _t('You paid');
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
    if (store.state.user?.id === notParticipatingMembers[0]!.id) {
      return _t('Everyone except you');
    }
    return __t('Everyone except {0}', userName(notParticipatingMembers[0]!.id));
  }
  return props.transaction.shares.map((share) => userName(share.userId)).join(', ');
});
const dateString = computed(() => {
  return formatDate(new Date(props.transaction.date));
});

const yourShareString = computed(() => {
  const userId = store.state.user?.id;
  if (!userId) {
    return null;
  }
  const yourShare = props.transaction.shares.find(share => share.userId === userId);
  if (!yourShare) {
    return null;
  }
  const totalShares = props.transaction.shares.reduce((sum, share) => {
    return sum + share.share;
  }, 0);
  return __t('Your share: {0}', formatMoney(yourShare.share * props.transaction.amount / totalShares));
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

/** Transaction type styles **/
.expense {
  --background: rgb(237, 187, 187);
  @media (prefers-color-scheme: dark) {
    --background: rgb(38, 13, 13);
  }
}

.transfer {
  --background: rgb(138, 184, 236);
  @media (prefers-color-scheme: dark) {
    --background: rgb(16, 33, 53);
  }
}


.income {
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