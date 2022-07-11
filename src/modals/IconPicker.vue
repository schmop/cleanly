<template>
  <ion-header>
    <ion-toolbar color="medium">
      <ion-title>
        {{ _t('Icon') }}
        <ion-icon
          :icon="closeCircleOutline"
          color="dark"
          @click="dismiss()"
          style="float: right"
        />
      </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light">
    <ion-item-group>
      <ion-item button v-for="(icon, name) in icons" :key="name" @click="select(`${name}`)">
        <ion-label>{{name}}</ion-label>
        <ion-icon :icon="icon" />
      </ion-item>
    </ion-item-group>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { closeCircleOutline } from "ionicons/icons";
import {
  IonLabel,
  IonInput,
  IonItemGroup,
  IonItem,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButton,
  IonFooter,
  modalController,
  menuController,
} from "@ionic/vue";
import icons from '../components/icons';
import { translations } from "../translation";

export default defineComponent({
  name: "IconPicker",
  components: {
    IonContent,
    IonToolbar,
    IonIcon,
    IonTitle,
    IonLabel,
    IonHeader,
    IonItemGroup,
    IonItem,
  },
  data: () => ({
    closeCircleOutline,
    icons,
  }),
  props: {
    iconReceiver: Object as () => EventTarget,
  },
  computed: {},
  methods: {
    ...translations,
    dismiss() {
      modalController.dismiss();
    },
    async select(icon: string) {
      this.iconReceiver?.dispatchEvent(new CustomEvent('icon', {detail: icon}));
      this.$emit('select', icon);
      this.dismiss();
    },
  },
});

</script>

<style scoped>
</style>