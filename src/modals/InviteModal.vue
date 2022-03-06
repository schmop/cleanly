<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        Invite
        <ion-icon
          :icon="closeCircleOutline"
          color="dark"
          @click="dismiss()"
          style="float: right"
        />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" @keypress.enter="invite()">
    <ion-item-group>
      <ion-item>
        <ion-label position="stacked">
          <ion-icon :icon="searchOutline" slot="start" />
          Search for username
        </ion-label>
        <ion-input type="text" v-model="inviteSearch" />
      </ion-item>

      <ion-list>
        <ion-item
          button
          v-for="(suggestion, index) in suggestions"
          @click="add(suggestion)"
          :key="index"
        >
          <ion-icon slot="start" :icon="addCircleOutline" />
          <ion-label> {{ suggestion.name }} </ion-label>
        </ion-item>
      </ion-list>
      <ion-item-divider />
      <ion-item v-if="selection != null">
        <ion-list>
          <ion-list-header>
            <ion-icon :icon="personOutline" slot="start" />
            Selected user to invite:
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
        Invite
      </ion-button>
      <ion-button color="light" @click="dismiss()">
        <ion-icon :icon="closeCircleOutline" slot="start" />
        Cancel
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
import client from "@/client";
import toast from "@/toast";
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
import router from "@/router";
import { Household } from "@/models/Household";
import debounce from "@/common/debounce";
import { LookupResult } from "@/models/LookupResult";

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
  async beforeMount() {
    const info = await client.dashboardInfo();
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
    dismiss() {
      modalController.dismiss();
    },
    add(result: LookupResult) {
      this.selection = result;
      this.suggestions = [];
      this.inviteSearch = "";
    },
    async invite() {
      if (null == this.selection?.id) {
        return;
      }
      await client.invite(this.selection?.id);
      this.dismiss();
    },
    async _search() {
      this.suggestions = await client.lookupUsers(this.inviteSearch);
    },
  },
});
</script>

<style scoped>
</style>