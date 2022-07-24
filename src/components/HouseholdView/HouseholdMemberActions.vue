<template>
    <ion-list>
        <ion-list-header>{{ __t('Actions for {0}', member?.name ?? '<unknown>') }}</ion-list-header>
        <ion-item button @click="openTransferOwnership">
            <ion-icon slot="start" :icon="returnUpForwardOutline" />
            <ion-label>{{ _t('Transfer ownership') }}</ion-label>
        </ion-item>
        <ion-item button @click="openKickMemberPrompt">
            <ion-icon slot="start" :icon="personRemoveOutline" />
            <ion-label>{{ _t('Kick member') }}</ion-label>
        </ion-item>
    </ion-list>
</template>

<script setup lang="ts">
import { computed, defineComponent, inject } from "vue";
import {
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonListHeader,
    alertController,
    popoverController,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { User } from "@/models/User";
import { _t, __t } from "@/translation";
import { personRemoveOutline, returnUpForwardOutline } from "ionicons/icons";
import toast from "@/toast";
import { householdClientSymbol, stateSymbol } from "@/dependency-injection/injection-keys";

const props = defineProps<{
    household: Household,
    member: User,
}>();
const state = inject(stateSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const user = computed(() => state.user);

async function dismiss(): Promise<boolean> {
    return popoverController.dismiss();
}
async function openTransferOwnership() {
    const alert = await alertController.create({
        header: __t('Do you want to transfer ownership to {0}?', props.member.name),
        buttons: [
            {
                text: _t('Ok'),
                role: 'confirm',
            },
            _t('Cancel'),
        ]
    });
    dismiss();
    await alert.present();
    if ((await alert.onDidDismiss()).role === 'confirm') {
        if (await householdClient.transferOwnershipTo(props.member.id, props.household.id)) {
            toast.success(__t('Successfully transfered ownership to {0}!', props.member.name));
            householdClient.dashboardInfo();

            return;
        }
        await toast.error(_t('There was an error transfering ownership to another member!'));
    }
}
async function openKickMemberPrompt() {
    const alert = await alertController.create({
        header: __t('Do you want to kick {0} from {1}?', props.member.name, props.household.name),
        buttons: [
            {
                text: _t('Ok'),
                role: 'confirm',
            },
            _t('Cancel'),
        ]
    });
    dismiss();
    await alert.present();
    if ((await alert.onDidDismiss()).role === 'confirm') {
        if (await householdClient.kickFromHousehold(props.member.id, props.household.id)) {
            toast.success(__t('Successfully kicked {0} from the household!', props.member?.name ?? _t('someone')));
            householdClient.dashboardInfo();

            return;
        }
        await toast.error(_t('There was an error kicking a member from the household!'));
    }
}

</script>

<style scoped>
</style>