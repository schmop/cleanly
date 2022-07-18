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
        <ion-input type="text" v-model="inviteSearch" ref="inviteSearch" />
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

<script lang="ts">
import { defineComponent } from "vue";
import {
  addCircleOutline,
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
import { translations } from "../translation";
import { container } from "@/container";

export default defineComponent({
  name: "InviteModal",
  components: {
    IonContent,
    IonToolbar,
    IonIcon,
    IonTitle,
    IonLabel,
    IonHeader,
    IonListHeader,
    IonList,
    IonInput,
    IonItemDivider,
    IonItemGroup,
    IonItem,
    IonButton,
    IonFooter,
  },
  props: {
    household: Object as () => Household,
  },
  data: () => ({
    addCircleOutline,
    searchOutline,
    personAddOutline,
    closeCircleOutline,
    personOutline,
    inviteSearch: "",
    suggestions: [] as LookupResult[],
    search: null as CallableFunction | null,
    selection: null as LookupResult | null,
  }),
  computed: {},
  watch: {
    inviteSearch() {
      if (null == this.search) {
        this.search = debounce(this._search, 250, true);
      }
      this.search();
    },
  },
  methods: {
    ...translations,
    dismiss() {
      modalController.dismiss();
    },
    add(result: LookupResult) {
      this.selection = result;
      this.suggestions = [];
      this.inviteSearch = "";
    },
    async invite() {
      if (null == this.household?.id || null == this.selection?.id) {
        return;
      }
      await container.getHouseholdClient().invite(this.household?.id, this.selection?.id);
      this.dismiss();
    },
    async _search() {
      let suggestions = await container.getAuthClient().lookupUsers(this.inviteSearch);
      const users = this.household?.users;
      if (null != users) {
        suggestions = suggestions.filter((suggestion: LookupResult) =>
          !users.some((user) => user.id != null && user.id === suggestion.id)
        );
      }
      this.suggestions = suggestions;
    },
  },
});
</script>

<style scoped>
</style>