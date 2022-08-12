<template>
  <ion-page>
    <ion-content>
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            {{ _t('Notification settings') }}
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item-group>
            <ion-item>
              <!--
                The timestamped key fixes the infinite update loop when programmatically setting the toggle value
                @link: https://github.com/ionic-team/ionic-framework/issues/20106#issuecomment-774001524
              -->
              <ion-toggle @ionChange="toggleNotifyTaskDue" :key="notifyTaskDue + (new Date()).toISOString()" :checked="notifyTaskDue"></ion-toggle>
              <ion-label>
                {{ _t('Tasks are due') }}
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-toggle @ionChange="toggleNotifyTaskDone" :key="notifyTaskDone + (new Date()).toISOString()" :checked="notifyTaskDone"></ion-toggle>
              <ion-label>
                {{ _t('Tasks are completed') }}
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-toggle @ionChange="toggleNotifyInvites" :key="notifyInvites + (new Date()).toISOString()" :checked="notifyInvites"></ion-toggle>
              <ion-label>
                {{ _t('Invited to a household') }}
              </ion-label>
            </ion-item>
          </ion-item-group>
        </ion-card-content>
      </ion-card>
    </ion-content>
    <ion-footer class="p-2">
      <ion-button @click="save">
        <ion-icon :icon="checkmarkOutline"/>
        {{ _t('Save') }}
      </ion-button>
      <ion-button @click="cancel" color="light">
        <ion-icon :icon="closeCircleOutline"/>
        {{ _t('Cancel') }}
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonIcon,
  IonToggle,
  IonLabel,
  IonButton,
  IonFooter,
  IonCardContent,
  IonItem,
  IonCardTitle,
  IonItemGroup,
} from "@ionic/vue";
import { storeSymbol } from "@/dependency-injection/injection-keys";
import { _t } from '../translation/index';
import { closeCircleOutline, checkmarkOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { userClientSymbol } from '../dependency-injection/injection-keys';
import toast from '@/toast';
import { UserSettings } from '../models/UserSettings';

const store = inject(storeSymbol)!;
const userClient = inject(userClientSymbol)!;
const router = useRouter();

const notifyTaskDue = ref(true);
const notifyTaskDone = ref(true);
const notifyInvites = ref(true);

function resetUiToStore() {
  const settings = store.state.userSettings;
  notifyTaskDue.value = settings.notifyTaskDue;
  notifyTaskDone.value = settings.notifyTaskDone;
  notifyInvites.value = settings.notifyInvites;
}

watch(store.state.userSettings, () => {
  resetUiToStore();
}, { immediate: true, deep: true });

function toggleNotifyTaskDue() {
  notifyTaskDue.value = !notifyTaskDue.value;
}

function toggleNotifyTaskDone() {
  notifyTaskDone.value = !notifyTaskDone.value;
}

function toggleNotifyInvites() {
  notifyInvites.value = !notifyInvites.value;
}

async function save() {
  try {
    const newSettings: UserSettings = {
      notifyInvites: notifyInvites.value,
      notifyTaskDone: notifyTaskDone.value,
      notifyTaskDue: notifyTaskDue.value,
    };
    await userClient.saveUserSettings(newSettings);
    store.setSettings(newSettings);
    router.push({name: 'dashboard'});
  } catch (error) {
    toast.error((error as Error).message);
  }
}

function cancel() {
  router.push({name: 'dashboard'});
  resetUiToStore();
}

</script>

<style scoped>
.p-2 {
  padding: 8px;
}
</style>