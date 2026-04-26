import type {OnyxEntry} from 'react-native-onyx';
import type {Report} from '@src/types/onyx';
import CONST from '@src/CONST';
import * as MoneyRequestUtils from './MoneyRequestUtils';
import * as TransactionUtils from './TransactionUtils';

/**
 * Returns the reason why a report requires attention, and the associated report action that needs attention.
 */
function getReasonAndReportActionThatRequiresAttention(
    optionOrReport: OnyxEntry<Report>,
    iouReportActionToApproveOrPay: OnyxEntry<Report>,
    policy: OnyxEntry<Report>,
): {reason: string; reportAction: OnyxEntry<Report>} | null {
    const hasOnlyPendingTransactions = optionOrReport?.transactionIDs?.every((transactionID) => {
        const transaction = TransactionUtils.getTransaction(transactionID);
        return TransactionUtils.isPending(transaction);
    }) ?? false;

    // We need to validate that hasOutstandingChildRequest is not stale by confirming there's actually an actionable IOU report
    const hasValidOutstandingChildRequest = optionOrReport?.hasOutstandingChildRequest === true && iouReportActionToApproveOrPay?.reportActionID;

    if (
        (hasValidOutstandingChildRequest || iouReportActionToApproveOrPay?.reportActionID) &&
        (policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO || !hasOnlyPendingTransactions)
    ) {
        return {
            reason: CONST.REQUIRES_ATTENTION_REASONS.HAS_CHILD_REPORT_AWAITING_ACTION,
            reportAction: iouReportActionToApproveOrPay,
        };
    }

    return null;
}

export default getReasonAndReportActionThatRequiresAttention;