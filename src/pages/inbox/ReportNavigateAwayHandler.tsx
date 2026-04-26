import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {NavigateToReportType} from '@libs/actions/Report';
import * as Report from '@libs/actions/Report';
import {isReportMessageEmpty} from '@libs/ReportUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

type ReportNavigateAwayHandlerProps = {
    report: OnyxEntry<Report>;
};

/**
 * Handles navigation when a report is closed or deleted.
 * Prevents pushing inaccessible reports onto the navigation stack when leaving a report.
 */
function ReportNavigateAwayHandler({report}: ReportNavigateAwayHandlerProps) {
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`);

    // Determine if the current report has been closed
    const didReportClose = report?.statusNum === 2 && report?.stateNum === 2;

    // Check if the parent report is accessible by the current user
    const isParentReportAccessible = parentReport && !isReportMessageEmpty(parentReport) && ReportActionsUtils.isActionableReportAction(parentReportActions?.[report?.parentReportActionID ?? '']);

    useEffect(() => {
        if (!didReportClose || !report?.reportID) {
            return;
        }

        // If the parent report is not accessible, navigate to the most recent accessible report instead of pushing the parent
        if (!isParentReportAccessible) {
            Report.navigateToMostRecentReport(true);
            return;
        }

        // Only navigate away if we are currently on the report being closed
        if (Navigation.getActiveRoute().includes(`report/${report.reportID}`)) {
            // Use navigateToMostRecentReport to replace the current route instead of pushing the parent report
            Report.navigateToMostRecentReport(true);
        }
    }, [didReportClose, report?.reportID, isParentReportAccessible]);

    return null;
}

export default ReportNavigateAwayHandler;