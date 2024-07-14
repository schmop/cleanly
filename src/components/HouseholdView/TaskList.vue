<template>
  <ion-page>
    <ion-content v-if="household">
      <div class="horizontal-scroll">
        <div class="scroll-inner-container">
          <ion-chip
            v-for="(category) in categories"
            :key="category"
            :color="selectedCategory === category ? 'success' : undefined"
            @click="toggleFilter(category)"
          >
            <component :is="icons[category]" />
            <XIcon
              v-if="selectedCategory === category"
              size="16"
            />
          </ion-chip>
        </div>
      </div>
      <TransitionGroup
        name="task-list"
        tag="div"
      >
        <TaskView
          v-for="(task) in filteredTasks"
          :key="task.id"
          :task="task"
          :household="household"
          :show-actions="true"
        />
      </TransitionGroup>

      <ion-card v-if="sortedTasks.length === 0">
        <ion-card-header>
          <ion-card-title> {{ _t('There are no tasks yet') }}</ion-card-title>
        </ion-card-header>
        <ion-card-content v-if="canManageTasks">
          <ion-button
            color="primary"
            @click="openTaskFormModal"
          >
            <CirclePlusIcon slot="start" />
            {{ _t('Create task') }}
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-fab
        v-if="canManageTasks"
        slot="fixed"
        vertical="bottom"
        horizontal="end"
      >
        <ion-fab-button @click="openTaskFormModal">
          <PlusIcon />
        </ion-fab-button>
      </ion-fab>

      <ion-refresher
        slot="fixed"
        @ionRefresh="dashboardRefresher.forceReload($event)"
      >
        <ion-refresher-content />
      </ion-refresher>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { taskSortByPriority } from "@/common/task-priority";
import { IconName, icons, isValidIcon } from "@/components/icons";
import { dashboardRefresherSymbol, gettersSymbol, householdClientSymbol } from "@/dependency-injection/injection-keys";
import TaskForm from '@/modals/TaskForm.vue';
import { _t } from '@/translation';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    menuController,
    modalController
} from "@ionic/vue";
import { computed, inject, ref } from 'vue';
import { CirclePlusIcon, PlusIcon, XIcon } from 'vue-tabler-icons';
import TaskView from '../TaskView.vue';

const getters = inject(gettersSymbol)!;
const householdClient = inject(householdClientSymbol)!;
const dashboardRefresher = inject(dashboardRefresherSymbol)!;

const selectedCategory = ref<IconName|null>(null);

const household = computed(() => getters.household.value);
const sortedTasks = computed(() => getters.tasks.value.concat().sort(taskSortByPriority));
const filteredTasks = computed(() => null === selectedCategory.value
    ? sortedTasks.value
    : sortedTasks.value.filter((task) => task.icon === selectedCategory.value)
);
const canManageTasks = computed(() => getters.canManageTasks.value());
const categories = computed<IconName[]>(() => {
    const iconWeights = sortedTasks.value
        .map((task) => task.icon)
        .reduce((iconMap: Record<string, number>, icon: string, index: number) => {
            iconMap[icon] = (iconMap[icon] ?? 0) + index;

            return iconMap;
        }, {});

    return Object.entries(iconWeights)
        .sort(([, weightA], [, weightB]) => weightB - weightA)
        .map(([icon,]) => icon)
        .filter(isValidIcon);
});

function toggleFilter(icon: IconName) {
    selectedCategory.value = selectedCategory.value !== icon ? icon : null;
}

async function openTaskFormModal(): Promise<void> {
    void menuController.close("menu");
    const TaskFormModal = await modalController.create({
        component: TaskForm,
        componentProps: {
            id: household.value?.id,
        },
    });
    await TaskFormModal.present();
    await TaskFormModal.onDidDismiss();
    await householdClient.dashboardInfo();
}
</script>

<style scoped>
.horizontal-scroll {
    padding: 8px 4px 0 4px;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-color: #999 #333;
    scrollbar-width: thin;
}

.horizontal-scroll::-webkit-scrollbar {
    height: 8px;
}

.horizontal-scroll::-webkit-scrollbar-thumb {
    /* Foreground */
    background: #999;
}

.horizontal-scroll::-webkit-scrollbar-track {
    /* Background */
    background: #333;
}

.scroll-inner-container {
    display: flex;
    width: fit-content;
}

.task-list-move, /* apply transition to moving elements */
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.5s ease;
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.task-list-leave-active {
  position: absolute;
}
</style>
