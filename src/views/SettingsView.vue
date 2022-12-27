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
              <ion-toggle @ionChange="toggleNotifyTaskDue" :key="notifyTaskDue + (new Date()).toISOString()"
                :checked="notifyTaskDue"></ion-toggle>
              <ion-label>
                {{ _t('Tasks are due') }}
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-toggle @ionChange="toggleNotifyTaskDone" :key="notifyTaskDone + (new Date()).toISOString()"
                :checked="notifyTaskDone"></ion-toggle>
              <ion-label>
                {{ _t('Tasks are completed') }}
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-toggle @ionChange="toggleNotifyInvites" :key="notifyInvites + (new Date()).toISOString()"
                :checked="notifyInvites"></ion-toggle>
              <ion-label>
                {{ _t('Invited to a household') }}
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-select @ionChange="changeLanguage" :placeholder="_t('Language')" interface="popover">
                <ion-select-option value="de">{{ _t('German') }}</ion-select-option>
                <ion-select-option value="en">{{ _t('English') }}</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-item-group>
        </ion-card-content>
      </ion-card>
    </ion-content>
    <ion-footer class="p-2">
      <ion-button @click="save">
        <CheckIcon />
        {{ _t('Save') }}
      </ion-button>
      <ion-button @click="cancel" color="light">
        <CircleXIcon />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { storeSymbol } from "@/dependency-injection/injection-keys";
import toast from '@/toast';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonFooter,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonToggle,
  SelectChangeEventDetail,
} from "@ionic/vue";
import { inject, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { CheckIcon, CircleXIcon } from 'vue-tabler-icons';
import { userClientSymbol } from '../dependency-injection/injection-keys';
import { UserSettings } from '../models/UserSettings';
import { _t } from '../translation/index';

const store = inject(storeSymbol)!;
const userClient = inject(userClientSymbol)!;
const router = useRouter();

const notifyTaskDue = ref(true);
const notifyTaskDone = ref(true);
const notifyInvites = ref(true);
const language = ref('de');

function resetUiToStore() {
  const settings = store.state.userSettings;
  notifyTaskDue.value = settings.notifyTaskDue;
  notifyTaskDone.value = settings.notifyTaskDone;
  notifyInvites.value = settings.notifyInvites;
  language.value = settings.language;
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

function changeLanguage(event: CustomEvent<SelectChangeEventDetail>) {
  language.value = event.detail.value;
}

async function save() {
  try {
    const newSettings: UserSettings = {
      notifyInvites: notifyInvites.value,
      notifyTaskDone: notifyTaskDone.value,
      notifyTaskDue: notifyTaskDue.value,
      language: language.value,
    };
    await userClient.saveUserSettings(newSettings);
    store.setSettings(newSettings);
    router.push({ name: 'dashboard' });
  } catch (error) {
    toast.error((error as Error).message);
  }
}

function cancel() {
  router.push({ name: 'dashboard' });
  resetUiToStore();
}

</script>

<style scoped>
.p-2 {
  padding: 8px;
}
</style>