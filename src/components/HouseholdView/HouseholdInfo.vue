<template>
    <ion-page>
        <ion-content>
            <ion-list>
                <ion-list-header>{{ _t('Household settings') }}</ion-list-header>
                <ion-item v-if="canManageTasks" button @click="openTaskFormModal">
                    <ion-icon slot="start" :icon="addCircleOutline" />
                    {{ _t('Add task') }}
                </ion-item>
                <ion-item v-if="canManageHousehold" button @click="openInviteModal">
                    <ion-icon slot="start" :icon="personAddOutline" />
                    {{ _t('Send invite') }}
                </ion-item>
                <ion-item button @click="openLeaveHouseholdPrompt">
                    <ion-icon slot="start" :icon="walkOutline" />
                    {{ _t('Leave household') }}
                </ion-item>
                <ion-item v-if="canManageHousehold" button @click="openDeleteHouseholdPrompt">
                    <ion-icon slot="start" :icon="trashOutline" />
                    {{ _t('Delete household') }}
                </ion-item>
            </ion-list>
            <ion-list>
                <ion-list-header>{{ _t('Members') }}</ion-list-header>
                <ion-item v-for="(member) in members" :key="member.id" :button="canPerformActionOn(member)"
                    @click="openMemberActionMenu(member)">
                    <ion-icon slot="start" :icon="privilegeIcons[privilege(member)]" />
                    {{ member.name }}
                    <ion-badge color="dark" slot="end" v-if="PrivilegeLevel.USER !== privilege(member)">
                        {{ privilegeLabels[privilege(member)] }}
                    </ion-badge>
                    <ion-badge slot="end" color="warning" class="vertical-center">
                        <ion-text>{{stars[member.id] ?? 0}}</ion-text>
                        <ion-icon class="ml-1" :icon="starOutline"/>
                    </ion-badge>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { gettersSymbol, householdClientSymbol } from "@/dependency-injection/injection-keys";
import InviteModal from "@/modals/InviteModal.vue";
import TaskForm from "@/modals/TaskForm.vue";
import { User } from "@/models/User";
import router from "@/router";
import toast from "@/toast";
import { _t } from "@/translation";
import {
alertController, IonBadge, IonContent, IonIcon, IonItem, IonList, IonListHeader, IonPage, IonText, menuController,
modalController, popoverController
} from "@ionic/vue";
import { addCircleOutline, cogOutline, colorWandOutline, personAddOutline, personOutline, starOutline, trashOutline, walkOutline } from "ionicons/icons";
import { computed, inject, watch } from 'vue';
import { stateSymbol } from '../../dependency-injection/injection-keys';
import { PrivilegeLevel } from '../../models/HouseholdPrivilege';
import HouseholdMemberActions from "./HouseholdMemberActions.vue";

const getters = inject(gettersSymbol)!;
const state = inject(stateSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const household = computed(() => getters.household.value);
const user = computed(() => state.user);
const privilege = (user: User) => getters.privilege.value(user.id);
const members = computed(() => {
    if (null == household.value) {
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
    [PrivilegeLevel.ADMIN.valueOf()]: cogOutline,
    [PrivilegeLevel.MODERATOR.valueOf()]: colorWandOutline,
    [PrivilegeLevel.USER.valueOf()]: personOutline,
}
const stars = computed(() => getters.stars.value ?? {});

watch(
    household,
    () => {
        const householdId = household.value?.id;
        if (null == householdId) {
            console.warn('No household found');
            return;
        }
        householdClient.retrieveStars(householdId);
    },
    {immediate: true}
);

async function openDeleteHouseholdPrompt() {
    if (!canManageHousehold.value || null == household.value) {
        console.error("Tried to delete household, but couldn't!");
        return;
    }
    const alert = await alertController.create({
        header: _t('Do you want to delete the household permanently? This cannot be undone!'),
        buttons: [
            {
                text: _t('Ok'),
                role: 'confirm',
            },
            _t('Cancel'),
        ]
    });
    await alert.present();
    if ((await alert.onDidDismiss()).role === 'confirm') {
        if (await householdClient.removeHousehold(household.value.id)) {
            householdClient.dashboardInfo();
            router.push({ name: 'dashboard' });
            toast.success(_t('Successfully deleted the household!'));

            return;
        }
        await toast.error(_t('There was an error deleting the household!'));
    }
}
async function openLeaveHouseholdPrompt() {
    if (null == household.value) {
        console.error("Tried to leave household, but couldn't!");
        return;
    }
    const alert = await alertController.create({
        header: _t('Do you want to leave the household?'),
        buttons: [
            {
                text: _t('Ok'),
                role: 'confirm',
            },
            _t('Cancel'),
        ]
    });
    await alert.present();
    if ((await alert.onDidDismiss()).role === 'confirm') {
        try {
            await householdClient.leaveHousehold(household.value.id);
            householdClient.dashboardInfo();
            router.push({ name: 'dashboard' });
            toast.success(_t('Successfully left the household!'));
        } catch (error: any) {
            if (typeof error.message === 'string') {
                await toast.error(error.message);
            } else {
                await toast.error(_t('There was an error leaving the household!'));
            }
        }
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
    popover.present();
}
function canPerformActionOn(member: User) {
    return null !== user.value && privilege(member) < privilege(user.value) && canManageHousehold.value;
}
async function openTaskFormModal(): Promise<void> {
    menuController.close("menu");
    const TaskFormModal = await modalController.create({
        component: TaskForm,
        componentProps: {
            id: household.value?.id,
        },
    });
    TaskFormModal.present();
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
    createHouseholdModal.present();
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
.ml-1 {
    margin-left: 2px;
}
</style>