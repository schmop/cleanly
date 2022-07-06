<template>
    <ion-list>
        <ion-list-header>{{__t('Actions for {0}', member?.name ?? '<unknown>')}}</ion-list-header>
        <ion-item button>
            <ion-icon slot="start" :icon="returnUpForwardOutline" />
            <ion-label>{{_t('Transfer ownership')}}</ion-label>
        </ion-item>
        <ion-item button @click="openKickMemberPrompt">
            <ion-icon slot="start" :icon="personRemoveOutline" />
            <ion-label>{{_t('Kick member')}}</ion-label>
        </ion-item>
    </ion-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonList,
    IonItem,
IonIcon,
IonLabel,
IonListHeader,
alertController,
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { mapState } from "vuex";
import { User } from "@/models/User";
import { translations, _t, __t } from "@/translation";
import { personRemoveOutline, returnUpForwardOutline } from "ionicons/icons";
import toast from "@/toast";
import client from "@/client";

export default defineComponent({
    name: "HouseholdMemberActions",
    components: {
        IonList,
        IonListHeader,
        IonItem,
        IonIcon,
        IonLabel,
    },
    data: () => ({
        personRemoveOutline,
        returnUpForwardOutline,
    }),
    props: {
        household: Object as () => Household,
        member: Object as () => User,
    },
    computed: {
        ...mapState(["user"]),
    },
    methods: {
        ...translations,
        async openKickMemberPrompt() {
            if (this.member?.id == null || this.household?.id == null) {
                console.error("Tried to kick a member from the household, but could't");
                return;
            }
            const alert = await alertController.create({
                header: __t('Do you want to kick {0} from {1}?', this.member.name, this.household.name),
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
                if (await client.kickFromHousehold(this.member.id, this.household.id)) {
                    toast.success(__t('Successfully kicked {0} from the household!', this.member?.name ?? _t('someone')));
                    client.dashboardInfo();

                    return;
                }
                await toast.error(_t('There was an error kicking a member from the household!'));
            }
        },
    }
});
</script>

<style scoped>
</style>