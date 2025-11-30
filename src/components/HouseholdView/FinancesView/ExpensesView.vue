<template>
  <ion-content>
    <FinanceTransactionRender
      v-for="transaction in transactions"
      :key="transaction.uuid"
      :transaction="transaction"
    />
  </ion-content>
</template>

<script setup lang="ts">
import FinanceTransactionRender from "@/components/HouseholdView/FinancesView/FinanceTransactionRender.vue";
import { FinanceTransaction } from "@/components/HouseholdView/FinancesView/finance-types";
import { IonContent } from "@ionic/vue";

const transactions: FinanceTransaction[] = [
  {
    uuid: '0ed00c01-dc74-456b-8a20-fffb957b8153',
    title: 'Schulden begleichen',
    amount: 100,
    sender: 4,
    shares: [{ userId: 3, share: 1 }],
    date: new Date('2008-02-28'),
    type: 'transfer'
  },
  {
    uuid: '6ef09774-feab-47b6-a4c6-17b697cb931f',
    title: 'Vinylplatten vom ehemaligen Drummer der Beatles',
    amount: 50,
    sender: 3,
    shares: [{ userId: 4, share: 1 }],
    date: new Date('2008-02-28'),
    type: 'expense'
  },
  {
    uuid: 'd4317afc-3751-449b-afbd-e08ebfbb2a85',
    title: 'Vinylplatten vom ehemaligen Drummer der BeatlesVinylplatten vom ehemaligen Drummer der BeatlesVinylplatten vom ehemaligen Drummer der BeatlesVinylplatten vom ehemaligen Drummer der Beatles',
    amount: 50,
    sender: 3,
    shares: [{ userId: 4, share: 1 }],
    date: new Date('2008-02-28'),
    type: 'expense'
  },
  {
    uuid: 'd4317afc-3751-449b-afbd-e08ebfbb2a85',
    title: 'Vinylplatten vom ehemaligen Drummer der BeatlesVinylplatten vom ehemaligen Drummer der BeatlesVinylplatten vom ehemaligen Drummer der BeatlesVinylplatten vom ehemaligen Drummer der Beatles',
    amount: 50,
    sender: 3,
    shares: [{ userId: 4, share: 1 }],
    date: new Date('2008-02-28'),
    type: 'income'
  }
];
</script>

<style scoped>

</style>