<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Invite') }}
        <ion-icon :icon="closeCircleOutline" color="dark" @click="dismiss()" style="float: right" />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" @keypress.enter="invite()">
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">
          <ion-icon :icon="searchOutline" slot="start" />
          {{ _t('Search for username') }}
        </ion-label>
        <ion-input type="text" v-model="inviteSearch" />
      </ion-item>
      <ion-list v-if="suggestions.length > 0">
        <ion-item button v-for="(suggestion, index) in suggestions" @click="add(suggestion)" :key="index">
          <ion-icon slot="start" :icon="personOutline" />
          <ion-label> {{ suggestion.name }} </ion-label>
        </ion-item>
      </ion-list>
      <ion-item-divider />
      <ion-item v-if="selection != null">
        <ion-list>
          <ion-list-header>
            <ion-icon :icon="personOutline" slot="start" />
            {{ _t('Selected user to invite:') }}
          </ion-list-header>
          <ion-item>
            {{ selection.name }}
          </ion-item>
        </ion-list>
      </ion-item>
    </ion-item-group>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button color="primary" @click="invite()">
        <ion-icon :icon="personAddOutline" slot="start" />
        {{ _t('Invite') }}
      </ion-button>
      <ion-button color="light" @click="dismiss()">
        <ion-icon :icon="closeCircleOutline" slot="start" />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { ref, reactive, Ref, inject, watch } from 'vue';
import {
  closeCircleOutline,
  personOutline,
  searchOutline,
  personAddOutline,
} from "ionicons/icons";
import {
  IonLabel,
  IonInput,
  IonItemGroup,
  IonItem,
  IonContent,
  IonHeader,
  IonToolbar,
  IonItemDivider,
  IonList,
  IonListHeader,
  IonTitle,
  IonIcon,
  IonButton,
  IonFooter,
  modalController,
} from "@ionic/vue";
import { Household } from "../models/Household";
import debounce from "../common/debounce";
import { LookupResult } from "../models/LookupResult";
import { authClientSymbol, householdClientSymbol } from '../dependency-injection/injection-keys';
import { _t, __t } from '@/translation';

const props = defineProps<{
  household: Household,
}>();
const authClient = inject(authClientSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const inviteSearch = ref('');
let suggestions: Ref<LookupResult[]> = ref([]);
const selection: Ref<null | LookupResult> = ref(null);

const search = debounce(async () => {
  let newSuggestions = await authClient.lookupUsers(inviteSearch.value);
  const users = props.household.users;
  if (null != users) {
    newSuggestions = newSuggestions.filter((suggestion: LookupResult) =>
      !users.some((user) => user.id != null && user.id === suggestion.id)
    );
  }
  suggestions.value = newSuggestions;
  console.log()
}, 250, true);

watch(
  inviteSearch,
  search,
);

function dismiss() {
  modalController.dismiss();
}
function add(result: LookupResult) {
  selection.value = result;
  suggestions.value = [];
  inviteSearch.value = "";
}
async function invite() {
  if (null == props.household.id || null == selection.value?.id) {
    return;
  }
  await householdClient.invite(props.household?.id, selection.value?.id);
  dismiss();
}
</script>

<style scoped>
</style>