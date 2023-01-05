<template>
  <ion-page>
    <ion-content id="invites">
      <ion-card
        v-for="(invite, index) in invites"
        :key="index"
      >
        <ion-card-header>
          <ion-card-title>
            <ion-text color="secondary">
              <i>{{ invite.inviter?.name ?? _t('Someone') }}</i>
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
              <ion-button
                color="success"
                @click="accept(invite)"
              >
                <DoorEnterIcon slot="start" />
                {{ _t('Join') }}
              </ion-button>
              <ion-button
                color="danger"
                @click="decline(invite)"
              >
                <CircleXIcon slot="start" />
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
import { householdClientSymbol, stateSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import { Invite } from "@/models/Invite";
import router from "@/router";
import toast from "@/toast";
import { _t } from "@/translation";
import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonPage,
    IonText,
    IonToolbar,
} from "@ionic/vue";
import { computed, inject } from "vue";
import { CircleXIcon, DoorEnterIcon } from 'vue-tabler-icons';

const store = inject(storeSymbol)!;
const state = inject(stateSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const invites = computed(() => state.invites);

async function backToDashboardIfEmpty() {
    if (invites.value.length === 0) {
        await router.push({name: 'dashboard'});
    }
}

async function accept(invite: Invite) {
    try {
        await householdClient.acceptInvite(invite);
        store.removeInvite(invite);
        await toast.success("Household joined successfully!");
        await backToDashboardIfEmpty();
    } catch (exception) {
        console.error("Could not accept invitation!", exception);
        await toast.error("Error: Could not accept invitation!");
    }
}

async function decline(invite: Invite) {
    try {
        await householdClient.declineInvite(invite);
        store.removeInvite(invite);
        await toast.info("Invitation declined");
        await backToDashboardIfEmpty();
    } catch (exception) {
        console.error("Could not decline invitation!", exception);
        await toast.error("Error: Could not decline invite!");
    }
}
</script>

<style scoped>

</style>
