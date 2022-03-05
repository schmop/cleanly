<template>
  <ion-page>
    <ion-content> </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-button color="primary">
          <ion-icon slot="start" :icon="addCircleOutline" />
          Create household
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { addCircleOutline } from "ionicons/icons";
import client from "@/client";
import toast from "@/toast";
import {
  IonPage,
  IonLabel,
  IonInput,
  IonItemGroup,
  IonItem,
  IonContent,
  IonItemDivider,
  IonFooter,
  IonToggle,
  IonToolbar,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import router from "@/router";

export default defineComponent({
  name: "DashBoard",
  components: {
    IonPage,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonIcon,
  },
  async beforeMount() {
    const info = await client.dashboardInfo();
  },
  data: () => ({}),
  computed: {},
  methods: {},
});
</script>

<style scoped>
</style>