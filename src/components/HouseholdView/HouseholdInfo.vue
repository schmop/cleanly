<template>
  <ion-page>
    <ion-content>
      <ion-list>
        <ion-list-header>{{ _t('Household settings') }}</ion-list-header>
        <ion-item
          v-if="canManageTasks"
          button
          @click="openTaskFormModal"
        >
          <CirclePlusIcon slot="start" />
          {{ _t('Add task') }}
        </ion-item>
        <ion-item
          v-if="canManageHousehold"
          lines="inset"
        >
          <RotateIcon slot="start" />
          <ion-select
            :value="household.reassignmentStrategy"
            interface="action-sheet"
            :placeholder="_t('Select reassignment strategy')"
            @ionChange="selectReassignmentStrategy"
          >
            <ion-select-option value="none">
              {{ _t('Do nothing') }}
            </ion-select-option>
            <ion-select-option value="unassign">
              {{ _t('Unassign') }}
            </ion-select-option>
            <ion-select-option value="rotate">
              {{ _t('Rotate') }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item
          v-if="canManageHousehold"
          button
          @click="openInviteModal"
        >
          <UserPlusIcon slot="start" />
          {{ _t('Send invite') }}
        </ion-item>
        <ion-item
          button
          @click="openLeaveHouseholdPrompt"
        >
          <WalkIcon slot="start" />
          {{ _t('Leave household') }}
        </ion-item>
        <ion-item
          v-if="canManageHousehold"
          button
          @click="openDeleteHouseholdPrompt"
        >
          <TrashXIcon slot="start" />
          {{ _t('Delete household') }}
        </ion-item>
        <ion-item
          v-if="canManageHousehold"
          button
          @click="openSetWebhookPrompt"
        >
          <WebhookIcon slot="start" />
          {{ _t('Set webhook') }}
        </ion-item>
      </ion-list>
      <ion-list>
        <ion-list-header>{{ _t('Members') }}</ion-list-header>
        <ion-item
          v-for="(member) in members"
          :key="member.id"
          :button="canPerformActionOn(member)"
          @click="openMemberActionMenu(member)"
        >
          <component
            :is="privilegeIcons[privilege(member)]"
            slot="start"
          />
          {{ member.name }}
          <ion-badge
            v-if="PrivilegeLevel.USER !== privilege(member)"
            slot="end"
            color="dark"
          >
            {{ privilegeLabels[privilege(member)] }}
          </ion-badge>
          <ion-badge
            slot="end"
            color="warning"
            class="vertical-center"
          >
            <ion-text class="text-vertical-center">
              {{ stars[member.id] ?? 0 }}
            </ion-text>
            <StarIcon
              class="ml-1"
              size="16"
            />
          </ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { confirmablePrompt, stringPrompt } from "@/alert/prompt";
import { gettersSymbol, householdClientSymbol, stateSymbol, storeSymbol } from "@/dependency-injection/injection-keys";
import InviteModal from "@/modals/InviteModal.vue";
import TaskForm from "@/modals/TaskForm.vue";
import { PrivilegeLevel } from '@/models/HouseholdPrivilege';
import { User } from "@/models/User";
import router from "@/router";
import toast, { showThrownError, success } from "@/toast";
import { _t } from "@/translation";
import { Clipboard } from '@capacitor/clipboard';
import {
    IonBadge,
    IonContent,
    IonItem,
    IonList,
    IonListHeader,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonText,
    menuController,
    modalController,
    popoverController,
    SelectCustomEvent,
    toastController
} from "@ionic/vue";
import { computed, inject, watch } from 'vue';
import {
    ChefHatIcon,
    CirclePlusIcon,
    RotateIcon,
    StarIcon,
    TrashXIcon,
    UserIcon,
    UserPlusIcon,
    WalkIcon,
    WandIcon,
    WebhookIcon
} from "vue-tabler-icons";
import HouseholdMemberActions from "./HouseholdMemberActions.vue";

const store = inject(storeSymbol)!;
const getters = inject(gettersSymbol)!;
const state = inject(stateSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const household = computed(() => getters.household.value);
const user = computed(() => state.user);
const privilege = (user: User) => getters.privilege.value(user.id);
const members = computed(() => {
    if (undefined === household.value) {
        return [];
    }
    return household.value.users.concat().sort((a: User, b: User) => {
        if (privilege(a) === privilege(b)) {
            return a.name.localeCompare(b.name);
        }
        return privilege(b) - privilege(a);
    });
});
const canManageHousehold = computed(() => null !== user.value && privilege(user.value) === PrivilegeLevel.ADMIN);
const canManageTasks = computed(() => null !== user.value && [PrivilegeLevel.MODERATOR, PrivilegeLevel.ADMIN].includes(privilege(user.value)));
const privilegeLabels = {
    [PrivilegeLevel.MODERATOR.valueOf()]: _t('Moderator'),
    [PrivilegeLevel.ADMIN.valueOf()]: _t('Admin'),
}
const privilegeIcons = {
    [PrivilegeLevel.ADMIN.valueOf()]: ChefHatIcon,
    [PrivilegeLevel.MODERATOR.valueOf()]: WandIcon,
    [PrivilegeLevel.USER.valueOf()]: UserIcon,
}
const stars = computed(() => getters.stars.value ?? {});

watch(
    household,
    async () => {
        const householdId = household.value?.id;
        if (null == householdId) {
            console.warn('No household found');
            return;
        }
        try {
            await householdClient.retrieveStars(householdId);
        } catch (err) {
            await showThrownError(err);
        }
    },
    {immediate: true}
);

async function selectReassignmentStrategy(event: SelectCustomEvent<string>) {
    if (undefined === household.value?.id) {
        return;
    }
    try {
        await householdClient.setReassignmentStrategy(household.value.id, event.detail.value);
        store.setReassignmentStrategy(household.value, event.detail.value);
        await success('Reassignment strategy changed successfully!');
    } catch (err) {
        await showThrownError(err);
    }
}

async function showSecretToast(secret: string) {
    const secretToast = await toastController.create({
        color: 'primary',
        header: _t('Authentication secret'),
        message: _t('Please copy and save this, you will not be able to retrieve this again later!'),
        buttons: [
            {
                text: _t('Copy'),
                role: 'copy',
            },
            _t('Dismiss'),
        ],
    });

    await secretToast.present();
    const toastDismiss = await secretToast.onDidDismiss();
    if (toastDismiss.role === 'copy') {
        await Clipboard.write({
            string: secret,
        });
        void toast.success('Secret was successfully copied to the clipboard!');
    }
}

async function openSetWebhookPrompt() {
    if (!canManageHousehold.value || undefined === household.value) {
        console.error("Tried to set webhook, but couldn't!");
        return;
    }

    const url = await stringPrompt(
        _t('Please enter the domain of your webhook endpoint, starting with "https://"'),
        _t('You can read more about webhooks in cleanly at <a href="https://cleanly.schmoppo.de/webhook/doc">https://cleanly.schmoppo.de/webhook/doc</a>'),
        _t('URL'),
    );

    if (false === url) {
        return;
    }
    try {
        const response = await householdClient.setWebhook(household.value.id, url);

        await showSecretToast(response.secret);
    } catch (err) {
        await toast.showThrownError(err);
    }
}

async function openDeleteHouseholdPrompt() {
    if (!canManageHousehold.value || undefined === household.value) {
        console.error("Tried to delete household, but couldn't!");
        return;
    }
    if (!(await confirmablePrompt(_t('Do you want to delete the household permanently? This cannot be undone!')))) {
        return;
    }
    if (!await householdClient.removeHousehold(household.value.id)) {
        await toast.error(_t('There was an error deleting the household!'));

        return;
    }
    await Promise.all([
        householdClient.dashboardInfo(),
        router.push({name: 'dashboard'}),
        toast.success(_t('Successfully deleted the household!')),
    ]);
}

async function openLeaveHouseholdPrompt() {
    if (undefined === household.value) {
        console.error("Tried to leave household, but couldn't!");
        return;
    }
    if (!(await confirmablePrompt(_t('Do you want to leave the household?')))) {
        return;
    }
    try {
        await householdClient.leaveHousehold(household.value.id);
        await Promise.all([
            householdClient.dashboardInfo(),
            router.push({name: 'dashboard'}),
            toast.success(_t('Successfully left the household!')),
        ]);
    } catch (error) {
        await toast.showThrownError(error, 'leaving the household');
    }
}

async function openMemberActionMenu(member: User) {
    if (!canPerformActionOn(member)) {
        return;
    }
    const popover = await popoverController.create({
        component: HouseholdMemberActions,
        cssClass: 'autowidth',
        componentProps: {
            household: household.value,
            member,
        }
    });
    await popover.present();
}

function canPerformActionOn(member: User) {
    return null !== user.value && privilege(member) < privilege(user.value) && canManageHousehold.value;
}

async function openTaskFormModal(): Promise<void> {
    await menuController.close("menu");
    const TaskFormModal = await modalController.create({
        component: TaskForm,
        componentProps: {
            id: household.value?.id,
        },
    });
    await TaskFormModal.present();
    await TaskFormModal.onDidDismiss();
    await householdClient.dashboardInfo();
}

async function openInviteModal(): Promise<void> {
    const createHouseholdModal = await modalController.create({
        component: InviteModal,
        componentProps: {
            household: household.value,
        },
    });
    await createHouseholdModal.present();
}
</script>

<style scoped>
</style>

<style>
.autowidth {
    --width: unset;
    --min-width: 250px;
}

.vertical-center {
    display: flex;
}

.text-vertical-center {
    display: flex;
    justify-content: center;
    flex-direction: column;
}

.ml-1 {
    margin-left: 2px;
}
</style>
