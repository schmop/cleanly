<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet />
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="tasks" :href="href('tasks')">
                    <CheckboxIcon />
                    <ion-label>{{ _t('Tasks') }}</ion-label>
                    <ion-badge class="badge-with-custom-icon-fix" v-if="numOverdueTasks > 0">{{
                            numOverdueTasks
                        }}
                    </ion-badge>
                </ion-tab-button>

                <ion-tab-button tab="checklist" :href="href('checklist')">
                    <ChecklistIcon />
                    <ion-label>{{ _t('Checklist') }}</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="activity" :href="href('activity')">
                    <TimelineIcon />
                    <ion-label>{{ _t('Activity') }}</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="statistics" :href="href('statistics')">
                    <ChartBarIcon />
                    <ion-label>{{ _t('Statistics') }}</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="household" :href="href('info')">
                    <HomeCogIcon />
                    <ion-label>{{ _t('Household') }}</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script setup lang="ts">
import { taskOverDue, taskSortByPriority } from "@/common/task-priority";
import { gettersSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import router from "@/router";
import { _t } from '@/translation';
import { IonBadge, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/vue";
import { computed, inject, onBeforeUnmount } from "vue";
import { ChartBarIcon, CheckboxIcon, ChecklistIcon, HomeCogIcon, TimelineIcon } from "vue-tabler-icons";

const store = inject(storeSymbol)!;
const getters = inject(gettersSymbol)!;

const household = computed(() => getters.household.value);
const tasks = computed(() => getters.tasks.value.concat().sort(taskSortByPriority));
const numOverdueTasks = computed(() => tasks.value.filter(task => taskOverDue(task)).length);


if (undefined === household.value) {
    router.push({name: 'dashboard'});
}
onBeforeUnmount(() => {
    store.viewHousehold(null);
});

function href(path: string) {
    return `/household/${path}`;
}
</script>

<style scoped>
.badge-with-custom-icon-fix {
    left: calc(50% + 6px);
    top: 8px;
}
</style>
