<template>
  <ion-page>
    <ion-content id="invites">
      <ion-card v-for="(invite, index) in invites" :key="index">
        <ion-card-header>
          <ion-card-title>
            <ion-text color="secondary">
              <i>{{ invite.inviter.name }}</i>
            </ion-text>
            {{_t('invited you to')}}
            <ion-text color="secondary">
              <i>{{ invite.householdName }}</i>
            </ion-text>
          </ion-card-title>
          <ion-card-subtitle>
            {{_t('Do you want to accept the invitation?')}}
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-toolbar>
            <ion-buttons slot="end">
              <ion-button color="success" @click="accept(invite)">
                <ion-icon slot="start" :icon="enterOutline" />
                {{_t('Join')}}
              </ion-button>
              <ion-button color="danger" @click="decline(invite)">
                <ion-icon slot="start" :icon="closeOutline" />
                {{_t('Decline')}}
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { closeOutline, enterOutline } from "ionicons/icons";
import client from "@/client";
import toast from "@/toast";
import router from "@/router";
import {
  IonPage,
  IonLabel,
  IonInput,
  IonItemGroup,
  IonItem,
  IonContent,
  IonCardHeader,
  IonModal,
  IonLoading,
  IonFooter,
  IonCardContent,
  IonMenuButton,
  IonMenu,
  IonCard,
  IonHeader,
  IonButtons,
  IonCardTitle,
  IonText,
  IonToolbar,
  IonTitle,
  IonList,
  IonButton,
  IonCardSubtitle,
  IonIcon,
  modalController,
  menuController,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { User } from "@/models/User";
import { Invite } from "@/models/Invite";
import { mapState, mapMutations } from "vuex";
import { translations } from "@/translation";

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonContent,
    IonCardContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonText,
    IonIcon,
  },
  data: () => ({
    enterOutline,
    closeOutline,
  }),
  mounted() {
    console.log(this.invites);
  },
  computed: {
    ...mapState(["invites", "user"]),
  },
  methods: {
    ...mapMutations(["removeInvite"]),
    ...translations,
    async accept(invite: Invite) {
      try {
        await client.acceptInvite(invite);
        this.removeInvite(invite);
        toast.success("Household joined successfully!");
        this.backToDashboardIfEmpty();
      } catch (exception) {
        console.error("Could not accept invitation!", exception);
        toast.error("Error: Could not accept invitation!");
      }
    },
    async decline(invite: Invite) {
      try {
        await client.declineInvite(invite);
        this.removeInvite(invite);
        toast.info("Invitation declined");
        this.backToDashboardIfEmpty();
      } catch (exception) {
        console.error("Could not decline invitation!", exception);
        toast.error("Error: Could not decline invite!");
      }
    },
    backToDashboardIfEmpty() {
      if (this.invites.length === 0) {
        router.push("/app/dashboard");
      }
    },
  },
});
</script>

<style scoped>
.button-badge {
  position: absolute;
  right: -6px;
  top: -9px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
</style>