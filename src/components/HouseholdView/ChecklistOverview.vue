<template>
  <ion-page>
    <ion-content>
      <ion-card
        v-for="(checklist) in checklists"
        :key="checklist.uuid"
        @click="openChecklist(checklist.uuid)"
      >
        <ion-card-header
          v-if="checklist.uuid !== renameState.checklist?.uuid"
          class="action-header"
        >
          <ion-card-title>
            {{ checklist.name }}
          </ion-card-title>
          <ion-buttons>
            <ion-button
              :title="_t('Rename checklist')"
              @click.stop="startRenameChecklist(checklist)"
            >
              <PencilIcon slot="icon-only" />
            </ion-button>
            <ion-button
              :title="_t('Delete checklist')"
              @click.stop="deleteChecklist(checklist)"
            >
              <TrashXIcon slot="icon-only" />
            </ion-button>
          </ion-buttons>
        </ion-card-header>
        <ion-card-header
          v-else
          class="action-header"
          @click.stop
        >
          <ion-input
            ref="renameInput"
            v-model="renameState.newName"
            :label="_t('Name')"
            label-placement="stacked"
            type="text"
          />
          <ion-buttons>
            <ion-button
              color="primary"
              :title="_t('Submit rename')"
              @click.stop="finalizeRenameChecklist()"
            >
              <CheckIcon slot="icon-only" />
            </ion-button>
            <ion-button
              color="secondary"
              :title="_t('Abort')"
              @click.stop="abortRenameChecklist()"
            >
              <XIcon slot="icon-only" />
            </ion-button>
          </ion-buttons>
        </ion-card-header>
        <ion-card-content>
          {{ checklist.checklist.length }} {{ _t('entries') }}
        </ion-card-content>
      </ion-card>
      <ion-card
        v-if="checklists.length === 0"
        key="nothing-yet"
      >
        <ion-card-header>
          <ion-card-title> {{ _t('You have no checklists') }}</ion-card-title>
        </ion-card-header>
      </ion-card>
      <ion-button
        v-if="canManageChecklists"
        vertical="bottom"
        expand="full"
        horizontal="end"
        @click="createChecklist"
      >
        <PlusIcon />
        {{ _t('Create new list') }}
      </ion-button>
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
import { confirmablePrompt } from "@/alert/prompt";
import {
  dashboardRefresherSymbol,
  gettersSymbol,
  householdClientSymbol,
  storeSymbol
} from "@/dependency-injection/injection-keys";
import { Checklist } from "@/models/Household";
import router from "@/router";
import { error, success } from "@/toast";
import { __t, _t } from "@/translation";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInput,
  IonPage,
  IonRefresher,
  IonRefresherContent
} from "@ionic/vue";
import { computed, ComputedRef, inject, nextTick, reactive, ref } from "vue";
import { CheckIcon, PencilIcon, PlusIcon, TrashXIcon, XIcon } from "vue-tabler-icons";

const dashboardRefresher = inject(dashboardRefresherSymbol)!;
const householdClient = inject(householdClientSymbol)!;
const getters = inject(gettersSymbol)!;
const store = inject(storeSymbol)!;

const canManageChecklists = computed(() => getters.canManageChecklists.value());
const household = computed(() => {
  return getters.household.value;
});
const checklists: ComputedRef<Checklist[]> = computed(() => {
  const householdId = household.value?.id;
  if (null == householdId) {
    void error('No household selected');
    return [];
  }
  return getters.checklists.value(householdId) ?? [];
});

const renameInput = ref<{$el: HTMLIonInputElement}[]|null>(null);
const renameState = reactive({
  checklist: null as Readonly<Checklist>|null,
  newName: '',
});

async function createChecklist() {
  await householdClient.createChecklist(household.value!.id);
  await householdClient.dashboardInfo(); // TODO: Do not reload the whole dashboard
}

async function openChecklist(uuid: string) {
  store.openChecklist(uuid);
  await router.push({name: 'checklist'});
}

async function startRenameChecklist(checklist: Checklist) {
  renameState.checklist = checklist;
  renameState.newName = checklist.name;
  await nextTick(); // wait for ion-input to render
  const ionInput = renameInput.value?.[0]; // refs in v-for are always arrays
  if (!ionInput) {
    console.warn('Could not focus input element to rename checklist.', checklist);
    return;
  }
  const inputElement = await ionInput.$el.getInputElement(); // wait for <input> to be rendered
  inputElement.focus();
}

async function finalizeRenameChecklist() {
  if (null == renameState.checklist) {
    return;
  }
  await householdClient.renameChecklist(renameState.checklist.uuid, renameState.newName);
  store.renameChecklist(renameState.checklist.uuid, renameState.newName);
  renameState.checklist = null;
  renameState.newName = '';
}

function abortRenameChecklist() {
  renameState.checklist = null;
}

async function deleteChecklist(checklist: Checklist) {
  if (!await confirmablePrompt(__t('Do you really want to delete "{0}" and all its contents?', checklist.name))) {
    return;
  }
  await householdClient.deleteChecklist(checklist.uuid);
  void success(__t('Checklist "{0}" deleted', checklist.name));
  await householdClient.dashboardInfo(); // TODO: Do not reload the whole dashboard
}
</script>

<style scoped>
.action-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>
