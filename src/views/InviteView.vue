<template>
  <ion-page>
    <ion-content id="invites">
      INVITES
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  addCircleOutline,
  closeCircleOutline,
  logOutOutline,
  mailOutline,
} from "ionicons/icons";
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
  IonToolbar,
  IonTitle,
  IonList,
  IonButton,
  IonIcon,
  modalController,
  menuController,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { User } from "@/models/User";
import { Invite } from "@/models/Invite";

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonContent,
  },
  props: {
    invites: Object as () => Array<Invite>
  },
  data: () => ({
  }),
  computed: {},
  methods: {
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