<template>
    <ion-page>
        <ion-content>
            <ion-list>
                <ion-list-header>{{ _t('Household settings') }}</ion-list-header>
                <ion-item button @click="openAddTaskModal">
                    <ion-icon slot="start" :icon="addCircleOutline" />
                    {{ _t('Add task') }}
                </ion-item>
                <ion-item button @click="openInviteModal">
                    <ion-icon slot="start" :icon="personAddOutline" />
                    {{ _t('Send invite') }}
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
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { mapState } from "vuex";
import AddTask from "@/modals/AddTask.vue";
import InviteModal from "@/modals/InviteModal.vue";
import { taskSortByPriority } from "@/common/task-priority";
import { translations } from "@/translation";
import client from "@/client";
import { addCircleOutline, cogOutline, personAddOutline, personOutline } from "ionicons/icons";
import { User } from "@/models/User";
import HouseholdMemberActions from "./HouseholdMemberActions.vue";

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
        }
    },
    methods: {
        ...translations,
        async openMemberActionMenu(member: User) {
            if (!this.canPerformActionOn(member)) {
                return;
            }
            const popover = await popoverController.create({
                component: HouseholdMemberActions,
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
        async openAddTaskModal(): Promise<void> {
            menuController.close("menu");
            const addTaskModal = await modalController.create({
                component: AddTask,
                componentProps: {
                    id: this.household?.id,
                },
            });
            addTaskModal.present();
            await addTaskModal.onDidDismiss();
            await client.dashboardInfo();
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