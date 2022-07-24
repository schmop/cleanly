<template>
    <ion-page>
        <ion-content>
            <ion-list>
                <ion-list-header>{{ _t('Household settings') }}</ion-list-header>
                <ion-item v-if="isAdmin" button @click="openTaskFormModal">
                    <ion-icon slot="start" :icon="addCircleOutline" />
                    {{ _t('Add task') }}
                </ion-item>
                <ion-item v-if="isAdmin" button @click="openInviteModal">
                    <ion-icon slot="start" :icon="personAddOutline" />
                    {{ _t('Send invite') }}
                </ion-item>
                <ion-item button @click="openLeaveHouseholdPrompt">
                    <ion-icon slot="start" :icon="walkOutline" />
                    {{ _t('Leave household') }}
                </ion-item>
                <ion-item v-if="isAdmin" button @click="openDeleteHouseholdPrompt">
                    <ion-icon slot="start" :icon="trashOutline" />
                    {{ _t('Delete household') }}
                </ion-item>
            </ion-list>
            <ion-list>
                <ion-list-header>{{ _t('Members') }}</ion-list-header>
                <ion-item v-for="(member) in members" :key="member.id" :button="canPerformActionOn(member)"
                    @click="openMemberActionMenu(member)">
                    <ion-icon slot="start" :icon="admin === member.id ? cogOutline : personOutline" />
                    {{ member.name }}
                    <ion-badge color="dark" slot="end" v-if="admin === member.id">
                        {{ _t('Admin') }}
                    </ion-badge>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonContent,
    IonPage,
    IonList,
    IonIcon,
    IonItem,
    IonListHeader,
    menuController,
    modalController,
    IonBadge,
    popoverController,
    alertController,
} from "@ionic/vue";
import TaskForm from "@/modals/TaskForm.vue";
import InviteModal from "@/modals/InviteModal.vue";
import { taskSortByPriority } from "@/common/task-priority";
import { _t } from "@/translation";
import { addCircleOutline, cogOutline, personAddOutline, personOutline, trashOutline, walkOutline } from "ionicons/icons";
import { User } from "@/models/User";
import HouseholdMemberActions from "./HouseholdMemberActions.vue";
import toast from "@/toast";
import router from "@/router";
import { container } from "@/dependency-injection/container";
import { computed, inject } from "vue";
import { gettersSymbol, householdClientSymbol } from "@/dependency-injection/injection-keys";
import { stateSymbol } from '../../dependency-injection/injection-keys';

const getters = inject(gettersSymbol)!;
const state = inject(stateSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const household = computed(() => getters.household.value);
const user = computed(() => state.user);
const tasks = computed(() => getters.tasks.value.concat().sort(taskSortByPriority));
const admin = computed(() => household.value?.admin);
const members = computed(() => {
    if (null == household.value) {
        return [];
    }
    return household.value.users.concat().sort((a: User, b: User) => {
        if (admin.value === a.id) {
            return -1;
        }
        if (admin.value === b.id) {
            return 1;
        }
        return a.name.localeCompare(b.name);
    });
});
const isAdmin = computed(() => user.value != null && admin.value != null && user.value.id === admin.value);

async function openDeleteHouseholdPrompt() {
    if (null == isAdmin.value || null == household.value) {
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
    if (true === isAdmin.value) {
        toast.warning(_t('You cannot leave a household you own. You need to transfer your privileges or delete the household completely!'));
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
        if (await householdClient.leaveHousehold(household.value.id)) {
            householdClient.dashboardInfo();
            router.push({ name: 'dashboard' });
            toast.success(_t('Successfully left the household!'));

            return;
        }
        await toast.error(_t('There was an error leaving the household!'));
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
            household: household,
            member,
        }
    });
    popover.present();
}
function canPerformActionOn(member: User) {
    if (!isAdmin.value || !user.value) {
        return false;
    }

    return member.id !== user.value.id;
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
</style>