<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Invite') }}
        <CircleXIcon
          style="float: right"
          @click="dismiss()"
        />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content
    color="light"
    @keypress.enter="invite()"
  >
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">
          <UserSearchIcon slot="start" />
          {{ _t('Search for username') }}
        </ion-label>
        <ion-input
          v-model="inviteSearch"
          type="text"
        />
      </ion-item>
      <ion-list v-if="suggestions.length > 0">
        <ion-item
          v-for="(suggestion, index) in suggestions"
          :key="index"
          button
          @click="add(suggestion)"
        >
          <UserIcon slot="start" />
          <ion-label> {{ suggestion.name }}</ion-label>
        </ion-item>
      </ion-list>
      <ion-item-divider />
      <ion-item v-if="selection != null">
        <ion-list>
          <ion-list-header>
            <UserIcon slot="start" />
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
      <ion-button
        color="primary"
        @click="invite()"
      >
        <UserPlusIcon slot="start" />
        {{ _t('Invite') }}
      </ion-button>
      <ion-button
        color="light"
        @click="dismiss()"
      >
        <CircleXIcon slot="start" />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { authClientSymbol, householdClientSymbol } from '@/dependency-injection/injection-keys';
import { Household } from "@/models/Household";
import { LookupResult } from "@/models/LookupResult";
import { showThrownError, success } from "@/toast";
import { _t } from '@/translation';
import {
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonInput,
    IonItem,
    IonItemDivider,
    IonItemGroup,
    IonLabel,
    IonList,
    IonListHeader,
    IonTitle,
    IonToolbar,
    modalController
} from "@ionic/vue";
import { inject, Ref, ref, watch } from 'vue';
import { CircleXIcon, UserIcon, UserPlusIcon, UserSearchIcon } from 'vue-tabler-icons';
import debounce from "../common/debounce";

const props = defineProps<{
    household: Household,
}>();
const authClient = inject(authClientSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const inviteSearch = ref('');
let suggestions: Ref<LookupResult[]> = ref([]);
const selection: Ref<null|LookupResult> = ref(null);

const search = debounce(async () => {
    const users = props.household.users;
    let newSuggestions = await authClient.lookupUsers(inviteSearch.value);
    newSuggestions = newSuggestions.filter((suggestion: LookupResult) =>
        !users.some((user) => user.id != null && user.id === suggestion.id)
    );
    suggestions.value = newSuggestions;
}, 250, true);

watch(
    inviteSearch,
    search,
);

async function dismiss() {
    await modalController.dismiss();
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
    try {
        await householdClient.invite(props.household?.id, selection.value?.id);
        await success(_t('Successfully invited users to household!'));
    } catch (err) {
        await showThrownError(err);
    }
    await dismiss();
}
</script>

<style scoped>

</style>
