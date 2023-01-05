<template>
  <ion-list>
    <ion-list-header>{{ __t('Actions for {0}', member?.name ?? '<unknown>') }}</ion-list-header>
    <ion-item
      button
      @click="openPromoteToAdmin"
    >
      <ChefHatIcon slot="start" />
      <ion-label>{{ _t('Promote to admin') }}</ion-label>
    </ion-item>
    <ion-item
      v-if="memberPrivilege === PrivilegeLevel.USER"
      button
      @click="openPromoteToModerator"
    >
      <WandIcon slot="start" />
      <ion-label>{{ _t('Promote to moderator') }}</ion-label>
    </ion-item>
    <ion-item
      v-if="memberPrivilege === PrivilegeLevel.MODERATOR"
      button
      @click="openDemoteToUser"
    >
      <ArrowDownCircleIcon slot="start" />
      <ion-label>{{ _t('Demote to user') }}</ion-label>
    </ion-item>
    <ion-item
      button
      @click="openKickMemberPrompt"
    >
      <UserMinusIcon slot="start" />
      <ion-label>{{ _t('Kick member') }}</ion-label>
    </ion-item>
  </ion-list>
</template>

<script setup lang="ts">
import { gettersSymbol, householdClientSymbol } from "@/dependency-injection/injection-keys";
import { Household } from "@/models/Household";
import { PrivilegeLevel } from "@/models/HouseholdPrivilege";
import { User } from "@/models/User";
import toast, { showThrownError } from "@/toast";
import { __t, _t } from "@/translation";
import {
    IonItem, IonLabel, IonList, IonListHeader,
    alertController,
    popoverController
} from "@ionic/vue";
import { computed, inject } from "vue";
import { ArrowDownCircleIcon, ChefHatIcon, UserMinusIcon, WandIcon } from 'vue-tabler-icons';

const props = defineProps<{
    household: Household,
    member: User,
}>();
const getters = inject(gettersSymbol)!;
const householdClient = inject(householdClientSymbol)!;

const memberPrivilege = computed(() => getters.privilege.value(props.member.id));

async function dismiss(): Promise<boolean> {
    return popoverController.dismiss();
}
async function openDemoteToUser() {
    return openChangePrivileges(_t('user'), PrivilegeLevel.USER);
}
async function openPromoteToModerator() {
    return openChangePrivileges(_t('moderator'), PrivilegeLevel.MODERATOR);
}
async function openPromoteToAdmin() {
    return openChangePrivileges(_t('admin'), PrivilegeLevel.ADMIN);
}

async function openChangePrivileges(nameLevel: string, level: PrivilegeLevel) {
    const alert = await alertController.create({
        header: __t('Do you want to make {0} {1}?', props.member.name, nameLevel),
        buttons: [
            {
                text: _t('Ok'),
                role: 'confirm',
            },
            _t('Cancel'),
        ]
    });
    void dismiss();
    await alert.present();
    if ((await alert.onDidDismiss()).role === 'confirm') {
        try {
            await householdClient.changePrivilege(props.member.id, props.household.id, level);
            await toast.success(__t('Successfully changed privileges of {0}!', props.member.name));
            await householdClient.dashboardInfo();
        } catch (err) {
            await showThrownError(err);
        }
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
    void dismiss();
    await alert.present();
    if ((await alert.onDidDismiss()).role === 'confirm') {
        if (await householdClient.kickFromHousehold(props.member.id, props.household.id)) {
            void toast.success(__t('Successfully kicked {0} from the household!', props.member?.name ?? _t('someone')));
            await householdClient.dashboardInfo();

            return;
        }
        await toast.error(_t('There was an error kicking a member from the household!'));
    }
}

</script>

<style scoped>

</style>
