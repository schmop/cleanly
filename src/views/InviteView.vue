<template>
  <ion-page>
    <ion-content id="invites">
      <ion-card v-for="(invite, index) in invites" :key="index">
        <ion-card-header>
          <ion-card-title>
            <ion-text color="secondary">
              <i>{{ invite.inviter.name }}</i>
            </ion-text>
            {{ _t('invited you to') }}
            <ion-text color="secondary">
              <i>{{ invite.householdName }}</i>
            </ion-text>
          </ion-card-title>
          <ion-card-subtitle>
            {{ _t('Do you want to accept the invitation?') }}
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-toolbar>
            <ion-buttons slot="end">
              <ion-button color="success" @click="accept(invite)">
                <ion-icon slot="start" :icon="enterOutline" />
                {{ _t('Join') }}
              </ion-button>
              <ion-button color="danger" @click="decline(invite)">
                <ion-icon slot="start" :icon="closeOutline" />
                {{ _t('Decline') }}
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { closeOutline, enterOutline } from "ionicons/icons";
import toast from "../toast";
import router from "../router";
import {
  IonPage,
  IonContent,
  IonCardHeader,
  IonCardContent,
  IonCard,
  IonButtons,
  IonCardTitle,
  IonText,
  IonToolbar,
  IonButton,
  IonCardSubtitle,
  IonIcon,
} from "@ionic/vue";
import { Invite } from "../models/Invite";
import { _t } from "../translation";
import { householdClientSymbol, stateSymbol, storeSymbol } from "@/dependency-injection/injection-keys";

const store = inject(storeSymbol)!;
const state = inject(stateSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const invites = computed(() => state.invites);

function backToDashboardIfEmpty() {
  if (invites.value.length === 0) {
    router.push({ name: 'dashboard' });
  }
}
async function accept(invite: Invite) {
  try {
    await householdClient.acceptInvite(invite);
    store.removeInvite(invite);
    toast.success("Household joined successfully!");
    backToDashboardIfEmpty();
  } catch (exception) {
    console.error("Could not accept invitation!", exception);
    toast.error("Error: Could not accept invitation!");
  }
}
async function decline(invite: Invite) {
  try {
    await householdClient.declineInvite(invite);
    store.removeInvite(invite);
    toast.info("Invitation declined");
    backToDashboardIfEmpty();
  } catch (exception) {
    console.error("Could not decline invitation!", exception);
    toast.error("Error: Could not decline invite!");
  }
}
</script>

<style scoped>
</style>