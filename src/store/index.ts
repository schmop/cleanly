import { createStore, Store } from 'vuex';
import { Household } from '../models/Household';
import { User } from '../models/User';
import { Invite } from '../models/Invite';

// declare your own store states
export interface State {
    households: Household[],
    user: null | User,
    invites: Invite[],
}

declare module '@vue/runtime-core' {
    // provide typings for `this.$store`
    interface ComponentCustomProperties {
        $store: Store<State>
    }
}


export const store = createStore<State>({
    state: () => ({
        households: [] as Household[],
        user: null as null | User,
        invites: [] as Invite[],
    }),
    mutations: {
        user(state, user) {
            state.user = user;
        },
        dashboard(state, data) {
            state.households = data.households;
            state.user = data.user;
            state.invites = data.invites;
        },
        removeInvite(state, inviteToRemove: Invite) {
            state.invites = state.invites.filter(invite => invite !== inviteToRemove);
        },
        joinHousehold(state, household: Household) {
            state.households.push(household);
        }
    }
});

export default store;