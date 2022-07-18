<template>
    <ion-page>
        <ion-content>
            <ion-list>
                <ion-list-header>{{ _t('Household settings') }}</ion-list-header>
                <ion-item button @click="openTaskFormModal">
                    <ion-icon slot="start" :icon="addCircleOutline" />
                    {{ _t('Add task') }}
                </ion-item>
                <ion-item button @click="openInviteModal">
                    <ion-icon slot="start" :icon="personAddOutline" />
                    {{ _t('Send invite') }}
                </ion-item>
                <ion-item button @click="openLeaveHouseholdPrompt">
                    <ion-icon slot="start" :icon="walkOutline" />
                    {{ _t('Leave household') }}
                </ion-item>
                <ion-item button @click="openDeleteHouseholdPrompt">
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

<script lang="ts">
import { defineComponent } from "vue";
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
import { Household } from "@/models/Household";
import { mapState } from "vuex";
import TaskForm from "@/modals/TaskForm.vue";
import InviteModal from "@/modals/InviteModal.vue";
import { taskSortByPriority } from "@/common/task-priority";
import { translations, _t } from "@/translation";
import { addCircleOutline, cogOutline, personAddOutline, personOutline, trashOutline, walkOutline } from "ionicons/icons";
import { User } from "@/models/User";
import HouseholdMemberActions from "./HouseholdMemberActions.vue";
import toast from "@/toast";
import router from "@/router";
import { container } from "@/container";

export default defineComponent({
    name: "HouseholdInfo",
    components: {
        IonContent,
        IonPage,
        IonItem,
        IonIcon,
        IonList,
        IonListHeader,
        IonBadge,
    },
    data: () => ({
        personAddOutline,
        addCircleOutline,
        personOutline,
        cogOutline,
        trashOutline,
        walkOutline,
    }),
    props: {
        id: Number,
    },
    computed: {
        ...mapState(["households", "user"]),
        household(): null | Household {
            return this.households.find((household: Household) => household.id === this.id);
        },
        tasks() {
            return this.household?.tasks.concat().sort(taskSortByPriority);
        },
        members(): undefined | User[] {
            return this.household?.users.concat().sort((a: User, b: User) => {
                if (this.admin === a.id) {
                    return -1;
                }
                if (this.admin === b.id) {
                    return 1;
                }
                return a.name.localeCompare(b.name);
            });
        },
        admin(): undefined | number | null {
            return this.household?.admin;
        },
        isAdmin(): boolean {
            return this.user.id === this.admin;
        },
        householdClient() {
            return container.getHouseholdClient();
        }
    },
    methods: {
        ...translations,
        async openDeleteHouseholdPrompt() {
            if (!this.isAdmin || this.id === undefined) {
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
                if (await this.householdClient.removeHousehold(this.id)) {
                    this.householdClient.dashboardInfo();
                    router.push('/app/dashboard');
                    toast.success(_t('Successfully deleted the household!'));

                    return;
                }
                await toast.error(_t('There was an error deleting the household!'));
            }
        },
        async openLeaveHouseholdPrompt() {
            if (!this.id) {
                console.error("Tried to leave household, but couldn't!");
                return;
            }
            if (this.isAdmin) {
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
                if (await this.householdClient.leaveHousehold(this.id)) {
                    this.householdClient.dashboardInfo();
                    router.push('/app/dashboard');
                    toast.success(_t('Successfully left the household!'));

                    return;
                }
                await toast.error(_t('There was an error leaving the household!'));
            }
        },
        async openMemberActionMenu(member: User) {
            if (!this.canPerformActionOn(member)) {
                return;
            }
            const popover = await popoverController.create({
                component: HouseholdMemberActions,
                cssClass: 'autowidth',
                componentProps: {
                    household: this.household,
                    member,
                }
            });
            popover.present();
        },
        canPerformActionOn(member: User) {
            if (!this.isAdmin) {
                return false;
            }

            return member.id !== this.user.id;
        },
        async openTaskFormModal(): Promise<void> {
            menuController.close("menu");
            const TaskFormModal = await modalController.create({
                component: TaskForm,
                componentProps: {
                    id: this.household?.id,
                },
            });
            TaskFormModal.present();
            await TaskFormModal.onDidDismiss();
            await this.householdClient.dashboardInfo();
        },
        async openInviteModal(): Promise<void> {
            const createHouseholdModal = await modalController.create({
                component: InviteModal,
                componentProps: {
                    household: this.household,
                },
            });
            createHouseholdModal.present();
        },
    },
});
</script>

<style scoped>
</style>

<style>
.autowidth {
    --width: unset;
    --min-width: 250px;
}
</style>