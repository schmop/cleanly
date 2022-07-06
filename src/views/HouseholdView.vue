<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tasks" :href="`${href}/tasks`">
          <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
          <ion-label>Tasks</ion-label>
          <ion-badge v-if="numOverdueTasks > 0">{{ numOverdueTasks }}</ion-badge>
        </ion-tab-button>

        <ion-tab-button tab="checklist" :href="`${href}/checklist`">
          <ion-icon :icon="listCircleOutline"></ion-icon>
          <ion-label>Checklist</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="household" :href="`${href}/info`">
          <ion-icon :icon="peopleOutline"></ion-icon>
          <ion-label>Household</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  addCircleOutline,
  checkmarkCircleOutline,
  listCircleOutline,
  personAddOutline,
  peopleOutline
} from "ionicons/icons";
import {
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonBadge,
  IonRouterOutlet,
  IonIcon,
} from "@ionic/vue";
import { Household } from "../models/Household";
import { mapState } from "vuex";
import { translations } from '../translation';
import { taskSortByPriority, taskOverDue } from "@/common/task-priority";

export default defineComponent({
  name: "HouseholdView",
  components: {
    IonPage,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonBadge,
    IonRouterOutlet,
    IonIcon,
  },
  data: () => ({
    addCircleOutline,
    personAddOutline,
    peopleOutline,
    checkmarkCircleOutline,
    listCircleOutline,
  }),
  props: {
    id: Number,
  },
  computed: {
    ...mapState(["households", "user"]),
    household(): null | Household {
      return this.households.find((household: Household) => household.id === this.id);
    },
    isAdmin(): boolean {
      return this.household?.admin === this.user.id;
    },
    tasks() {
      return this.household?.tasks.concat().sort(taskSortByPriority);
    },
    href() {
      return `/app/household/${this.id}`;
    },
    numOverdueTasks() {
      return this.tasks?.filter(task => taskOverDue(task)).length ?? 0;
    },
  },
  methods: {
    ...translations,
  },
});
</script>

<style scoped>
</style>