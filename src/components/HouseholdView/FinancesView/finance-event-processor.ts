import { Store } from "@/store";
import { error } from "@/toast";
import { isFinanceEvent } from "@/components/HouseholdView/FinancesView/finance-types.guard";
import { fetchFinanceSummary } from "@/components/HouseholdView/FinancesView/finance-data-refresher";

export class FinanceEventProcessor {
    constructor(private store: Store) {
    }

    process(payload: unknown) {
        if (!isFinanceEvent(payload)) {
            void error('Received invalid finance transaction event!');
            console.error('Invalid invite event payload given:', payload);

            return;
        }
        switch (payload.type) {
            case 'create':
                this.store.addTransaction(payload.household_id, payload.transaction);
                void fetchFinanceSummary();
                break;
            case 'update':
                this.store.removeTransaction(payload.household_id, payload.transaction.uuid);
                this.store.addTransaction(payload.household_id, payload.transaction);
                void fetchFinanceSummary();
                break;
            case 'delete':
                this.store.removeTransaction(payload.household_id, payload.transaction.uuid);
                void fetchFinanceSummary();
                break;
        }
    }
}