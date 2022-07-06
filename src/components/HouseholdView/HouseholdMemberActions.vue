<template>
    <ion-list>
        <ion-item button>
            <ion-icon slot="start" :icon="returnUpForwardOutline" />
            <ion-label>{{_t('Transfer ownership')}}</ion-label>
        </ion-item>
        <ion-item button>
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
} from "@ionic/vue";
import { Household } from "@/models/Household";
import { mapState } from "vuex";
import { User } from "@/models/User";
import { translations } from "@/translation";
import { personRemoveOutline, returnUpForwardOutline } from "ionicons/icons";

export default defineComponent({
    name: "HouseholdMemberActions",
    components: {
        IonList,
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
        ...translations
    }
});
</script>

<style scoped>
</style>