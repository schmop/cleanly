<template>
  <IonItem
    lines="none"
  >
    <IonLabel
      position="stacked"
      required
    >
      {{ _t('Server URL') }}
    </IonLabel>
    <p
      id="server-url-popover"
      class="there-is-info-underneath-me"
    >
      {{ shortServerUrl }}
    </p>
    <IonPopover
      trigger="server-url-popover"
      trigger-action="click"
    >
      <IonContent class="ion-padding">
        {{ serverUrl }}
      </IonContent>
    </IonPopover>
    <IonButton
      id="edit-server-url-button"
      slot="start"
      class="center-self"
      size="default"
      fill="clear"
    >
      <PencilIcon slot="icon-only" />
    </IonButton>

    <!-- Create modal to edit server URL -->
    <IonModal
      ref="modal"
      :is-open="false"
      trigger="edit-server-url-button"
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {{ _t('Edit Server URL') }}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong
              fill="clear"
              size="small"
              @click="dismissModal"
            >
              {{ _t('Done') }}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent class="ion-padding">
        <IonCard>
          <IonCardContent>
            <IonNote>
              {{
                _t('Please specify the URL of the Cleanly server you want to connect to. If you are unsure, leave it at the default value.')
              }}
            </IonNote>
            <IonRadioGroup
              v-model="customServerSelect"
              :value="customServerSelect"
            >
              <IonItem>
                <IonRadio
                  justify="start"
                  label-placement="end"
                  value="default"
                >
                  <IonLabel
                    position="stacked"
                    required
                  >
                    {{ _t('Default Server') }}
                  </IonLabel>
                  <IonText
                    class="padding"
                    color="medium"
                  >
                    {{ getDefaultWebHost() }}
                  </IonText>
                </IonRadio>
              </IonItem>
              <IonItem>
                <IonRadio
                  value="custom"
                  justify="start"
                  label-placement="end"
                >
                  <IonLabel
                    position="stacked"
                    required
                  >
                    {{ _t('Custom server URL') }}
                  </IonLabel>
                  <IonInput
                    v-if="customServerSelect === 'custom'"
                    v-model="enteredServerUrl"
                    :autofocus="true"
                    :aria-label="_t('Custom server URL')"
                    type="url"
                  />
                  <p
                    v-else
                    class="padding"
                  >
                    {{ enteredServerUrl }}
                  </p>
                </IonRadio>
              </IonItem>
            </IonRadioGroup>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonModal>

    <IonButton
      id="click-trigger"
      slot="end"
      class="center-self"
      shape="round"
      size="small"
      fill="clear"
    >
      <InfoCircleFilledIcon slot="icon-only" />
    </IonButton>
    <IonPopover
      trigger="click-trigger"
      trigger-action="click"
    >
      <IonContent class="ion-padding">
        {{ _t('The URL of the Cleanly server you want to connect to.') }}
      </IonContent>
    </IonPopover>
  </IonItem>
</template>
<script setup lang="ts">
import { InfoCircleFilledIcon, PencilIcon } from "vue-tabler-icons";
import { _t } from "@/translation";
import { ComponentInstance, computed, ref, watch } from "vue";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonNote,
  IonPopover,
  IonRadio,
  IonRadioGroup, IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { getDefaultWebHost } from "@/client/host";

const enteredServerUrl = ref('https://example.org');
const modal = ref<ComponentInstance<typeof IonModal>>();
const customServerSelect = ref<'default' | 'custom'>('default');

const model = defineModel<string>({required: true});

const serverUrl = computed(() => {
  if (customServerSelect.value === 'default') {
    return getDefaultWebHost();
  } else {
    return enteredServerUrl.value;
  }
});
const shortServerUrl = computed(() => {
  try {
    const url = new URL(serverUrl.value);
    return url.hostname;
  } catch {
    return serverUrl.value;
  }
});
watch(serverUrl, (newUrl) => {
  model.value = newUrl;
}, {immediate: true});

function dismissModal() {
  modal.value?.$el.dismiss();
}

</script>
<style scoped>

.center-self {
  align-self: end;
}

.there-is-info-underneath-me {
  cursor: pointer;
  text-decoration: underline;
  padding-bottom: 8px;
}

.padding {
  padding-top: 10px;
  padding-bottom: 8px;
  font-size: 16px;
  display: inline-block;
}
</style>
<style>
ion-radio::part(label) {
  width: 100%;
}
/*ion-item::part(native) {
  border: 1px solid var(--ion-color-step-300, var(--ion-background-color-step-300, #b3b3b3));
}*/
</style>