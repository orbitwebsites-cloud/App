import type {Report} from '@src/types/onyx/Report';
import type {Transaction} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as CurrencyUtils from './CurrencyUtils';
import * as TransactionUtils from './TransactionUtils';

/**
 * Gets the non-held total and full total of a report.
 *
 * @param report - The report to get the totals for
 * @param shouldExcludeNonReimbursables - Whether to exclude non-reimbursable transactions from the totals
 * @returns An object containing the total and unheldTotal
 */
function getNonHeldAndFullAmount(report: Report, shouldExcludeNonReimbursables: boolean): {total: number; unheldTotal: number} {
    if (!report || isEmptyObject(report)) {
        return {total: 0, unheldTotal: 0};
    }

    const transactions = Object.values(report.transactionList ?? {});
    let total = 0;
    let unheldTotal = 0;

    transactions.forEach((transaction: Transaction) => {
        if (!TransactionUtils.isValidMoneyRequestTransaction(transaction)) {
            return;
        }

        const amount = TransactionUtils.getAmount(transaction);
        const currency = TransactionUtils.getCurrency(transaction);
        const isReimbursable = TransactionUtils.isReimbursable(transaction);
        const isOnHold = TransactionUtils.isOnHold(transaction);

        // Skip non-reimbursable transactions if we're excluding them
        if (shouldExcludeNonReimbursables && !isReimbursable) {
            return;
        }

        // Convert amount to base currency (USD) for consistent comparison
        const amountInBaseCurrency = CurrencyUtils.convertToUSD(amount, currency);

        total += amountInBaseCurrency;
        if (!isOnHold) {
            unheldTotal += amountInBaseCurrency;
        }
    });

    return {total, unheldTotal};
}

export {getNonHeldAndFullAmount};