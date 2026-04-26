import * as API from 'src/libs/API';
import * as CurrencyUtils from 'src/libs/CurrencyUtils';
import * as PolicyUtils from 'src/libs/PolicyUtils';
import * as Session from 'src/libs/Session';
import * as User from 'src/libs/actions/User';
import CONST from 'src/CONST';
import * as Localize from 'src/libs/Localize';

/**
 * Split an expense among multiple participants
 *
 * @param {Object} expense - The expense to split
 * @param {Array} participants - Array of participant emails
 * @param {String} reportID - The report ID where the split expense should be created
 * @param {String} policyID - The policy ID of the workspace
 */
function splitExpense(expense, participants, reportID, policyID) {
    // Check if the user has an active session
    if (!Session.isActive()) {
        return;
    }

    // Check if the workspace is expired
    const policy = PolicyUtils.getPolicy(policyID);
    if (policy && policy.pendingAction === CONST.POLICY.PENDING_ACTION.DELETE) {
        // Trigger paywall for expired workspace
        User.triggerPaywall();
        return;
    }

    // Proceed with splitting the expense
    API.splitBill({
        amount: expense.amount,
        currency: expense.currency,
        comment: expense.comment,
        participants,
        reportID,
        policyID,
    });
}

export {
    splitExpense,
};