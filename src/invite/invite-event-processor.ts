import { Store } from '@/store';
import { error } from '@/toast';
import { isInviteEvent } from './InviteEvent.guard';

export class InviteEventProcessor {
    constructor(private store: Store) {
    }


    process(payload: unknown): void {
        if (!isInviteEvent(payload)) {
            error('Received invalid invite event!');
            console.error('Invalid invite event payload given:', payload);

            return;
        }

        this.store.addInvite(payload.invite);
    }

}
