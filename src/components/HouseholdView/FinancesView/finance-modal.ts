import { modalController } from "@ionic/vue";
import ExpenseFormModal from "@/modals/ExpenseFormModal.vue";
import { isFinanceTransaction } from "@/components/HouseholdView/FinancesView/finance-types.guard";
import { error, showThrownError, success } from "@/toast";
import { _t } from "@/translation";
import { fetchFinanceSummary } from "@/components/HouseholdView/FinancesView/finance-data-refresher";
import { container } from "@/dependency-injection/container";
import { store } from "@/store";
import { FinanceTransaction } from "@/components/HouseholdView/FinancesView/finance-types";

export async function openExpenseFormModal(transactionToEdit?: FinanceTransaction) {
    const resultReceiver = new EventTarget();
    let receivedEvent: unknown = null;
    resultReceiver.addEventListener('select', (event) => {
        receivedEvent = event;
    });
    const addExpenseModal = await modalController.create({
        component: ExpenseFormModal,
        componentProps: {
            resultReceiver,
            transaction: transactionToEdit,
        }
    });
    await addExpenseModal.present();
    await addExpenseModal.onDidDismiss();

    if (!(receivedEvent instanceof CustomEvent)) {
        return;
    }
    if (!isFinanceTransaction(receivedEvent.detail)) {
        void error('Add/Edit Expense - Invalid transaction received:', receivedEvent.detail);
        return;
    }
    if (null === store.state.viewedHousehold) {
        void error('Add/Edit Expense - No household selected!');
        return;
    }
    const transaction = receivedEvent.detail;
    const householdId = store.state.viewedHousehold;
    try {
        if (transactionToEdit) {
            await container.getHouseholdClient().updateTransaction(householdId, transaction);
            store.removeTransaction(householdId, transaction.uuid);
            void success(_t('Transaction updated successfully'));
        } else {
            await container.getHouseholdClient().addTransaction(householdId, transaction);
            void success(_t('Transaction added successfully'));
        }
        store.addTransaction(householdId, transaction);
        void fetchFinanceSummary();
    } catch (err) {
        void showThrownError(err, 'adding/editing expense');
    }
}