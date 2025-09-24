<template>
  <ion-page>
    <ion-content>
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            {{ _t('Settings') }}
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item-group>
            <ion-item>
              <ion-select
                :value="language"
                :placeholder="_t('Language')"
                interface="popover"
                @ionChange="changeLanguage"
              >
                <ion-select-option value="de">
                  {{ _t('German') }}
                </ion-select-option>
                <ion-select-option value="schwobi">
                  {{ _t('Swabian') }}
                </ion-select-option>
                <ion-select-option value="en">
                  {{ _t('English') }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <!--
                The timestamped key fixes the infinite update loop when programmatically setting the toggle value
                @link: https://github.com/ionic-team/ionic-framework/issues/20106#issuecomment-774001524
              -->
              <ion-toggle
                :label="_t('Swipe to finish tasks')"
                :checked="swipeToFinishTasks"
                :enable-on-off-labels="true"
                @ionChange="toggleSwipeToFinishTasks"
              >
                <ion-label>
                  {{ _t('Swipe to finish tasks') }}
                </ion-label>
              </ion-toggle>
            </ion-item>
          </ion-item-group>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            {{ _t('Notification settings') }}
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item-group>
            <ion-item>
              <ion-toggle
                :enable-on-off-labels="true"
                :label="_t('Tasks are due')"
                :checked="notifyTaskDue"
                @ionChange="toggleNotifyTaskDue"
              >
                <ion-label>
                  {{ _t('Tasks are due') }}
                </ion-label>
              </ion-toggle>
            </ion-item>
            <ion-item>
              <ion-toggle
                :enable-on-off-labels="true"
                :label="_t('Tasks are completed')"
                :checked="notifyTaskDone"
                @ionChange="toggleNotifyTaskDone"
              >
                <ion-label>
                  {{ _t('Tasks are completed') }}
                </ion-label>
              </ion-toggle>
            </ion-item>
            <ion-item>
              <ion-toggle
                :enable-on-off-labels="true"
                :label="_t('Invited to a household')"
                :checked="notifyInvites"
                @ionChange="toggleNotifyInvites"
              >
                <ion-label>
                  {{ _t('Invited to a household') }}
                </ion-label>
              </ion-toggle>
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
      <ion-button
        color="light"
        @click="cancel"
      >
        <CircleXIcon />
        {{ _t('Cancel') }}
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { storeSymbol, userClientSymbol } from "@/dependency-injection/injection-keys";
import { UserSettings } from '@/models/UserSettings';
import toast from '@/toast';
import { _t, Language } from '@/translation';
import { SelectCustomEvent } from "@ionic/core";
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
} from "@ionic/vue";
import { inject, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { CheckIcon, CircleXIcon } from 'vue-tabler-icons';

const store = inject(storeSymbol)!;
const userClient = inject(userClientSymbol)!;
const router = useRouter();

const notifyTaskDue = ref(true);
const notifyTaskDone = ref(true);
const notifyInvites = ref(true);
const swipeToFinishTasks = ref(false);
const language = ref<Language>('de');

function resetUiToStore() {
  const settings = store.state.userSettings;
  notifyTaskDue.value = settings.notifyTaskDue;
  notifyTaskDone.value = settings.notifyTaskDone;
  notifyInvites.value = settings.notifyInvites;
  swipeToFinishTasks.value = settings.swipeToFinishTasks;
  language.value = settings.language;
}

watch(store.state.userSettings, () => {
  resetUiToStore();
}, {immediate: true, deep: true});

function toggleNotifyTaskDue() {
  notifyTaskDue.value = !notifyTaskDue.value;
}

function toggleNotifyTaskDone() {
  notifyTaskDone.value = !notifyTaskDone.value;
}

function toggleNotifyInvites() {
  notifyInvites.value = !notifyInvites.value;
}

function toggleSwipeToFinishTasks() {
  swipeToFinishTasks.value = !swipeToFinishTasks.value;
}

function changeLanguage(event: SelectCustomEvent<Language>) {
  language.value = event.detail.value;
}

async function save() {
  try {
    const newSettings: UserSettings = {
      notifyInvites: notifyInvites.value,
      notifyTaskDone: notifyTaskDone.value,
      notifyTaskDue: notifyTaskDue.value,
      swipeToFinishTasks: swipeToFinishTasks.value,
      language: language.value,
    };
    await userClient.saveUserSettings(newSettings);
    store.setSettings(newSettings);
    await router.push({name: 'dashboard'});
  } catch (error) {
    await toast.error((error as Error).message);
  }
}

async function cancel() {
  await router.push({name: 'dashboard'});
  resetUiToStore();
}

</script>

<style scoped>
.p-2 {
  padding: 8px;
}
</style>
