import type {OnyxEntry} from 'react-native-onyx';
import type {Report} from '@src/types/onyx';
import type {Route} from '@react-navigation/native';
import type {WithNavigationFocusProps} from '@hocs/withNavigationFocus';
import type {WithWindowDimensionsProps} from '@hocs/withWindowDimensions';
import type {WithPersonalDetailsProps} from '@hocs/withPersonalDetails';
import type {WithReportActionsProps} from '@hocs/withReportActions';
import type {WithReportOrchestratorProps} from '@hocs/withReportOrchestrator';
import type {WithNetworkProps} from '@hocs/withNetwork';
import type {WithOnyxProps} from '@hocs/withOnyx';
import type {WithUserWalletProps} from '@hocs/withUserWallet';
import type {WithBlockedFromConciergeProps} from '@hocs/withBlockedFromConcierge';
import type {WithPolicyProps} from '@hocs/withPolicy';
import type {WithBetasProps} from '@hocs/withBetas';
import type {WithPersonalDetailsProps} from '@hocs/withPersonalDetails';
import type {WithReportActionsProps} from '@hocs/withReportActions';
import type {WithReportOrchestratorProps} from '@hocs/withReportOrchestrator';
import type {WithNetworkProps} from '@hocs/withNetwork';
import type {WithOnyxProps} from '@hocs/withOnyx';
import type {WithUserWalletProps} from '@hocs/withUserWallet';
import type {WithBlockedFromConciergeProps} from '@hocs/withBlockedFromConcierge';
import type {WithPolicyProps} from '@hocs/withPolicy';
import type {WithBetasProps} from '@hocs/withBetas';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';

const ReportScreen = () => {
    // Handle the leave button press
    const leaveRoom = () => {
        if (!report) {
            return;
        }

        // Show confirmation modal before leaving
        Navigation.navigate('Modal', {
            type: 'confirm',
            title: Localize.translateLocal('common.confirm'),
            message: Localize.translateLocal('reportActionsView.leaveRoomConfirmation'),
            onConfirm: () => {
                // Leave the report
                Report.leaveRoom(report.reportID);

                // Use navigation service to handle the navigation after leaving
                Navigation.leaveReport(report.reportID);
            },
        });
    };

    return {
        // other props
        leaveRoom,
    };
};

export default ReportScreen;