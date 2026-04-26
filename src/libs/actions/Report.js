import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Approves a report (expense report or invoice)
 *
 * @param {String} reportID
 * @param {Boolean} approveAll - whether to approve all expenses (including held ones)
 */
function approveReport(reportID, approveAll = true) {
    API.write('ApproveReport', {
        reportID,
        approveAll,
    }, {
        optimisticData: [
            {
                onyxMethod: 'merge',
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    stateNum: 3, // Approved state
                    statusNum: 1, // Open status
                },
            },
        ],
        // If the approval fails, we want to show the error on the button
        failureData: [
            {
                onyxMethod: 'set',
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    error: 'report.genericCreateReportError',
                },
            },
        ],
    });
}

export {approveReport};