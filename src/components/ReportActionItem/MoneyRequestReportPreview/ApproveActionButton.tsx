import {delegateEmailSelector} from '@selectors/Account';
import React from 'react';
import Button from '@components/Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import {hasHeldExpenses as hasHeldExpensesReportUtils, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

type ApproveActionButtonProps = {
    iouReportID: string | undefined;
    startApprovedAnimation: () => void;
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, canPay?: boolean) => void;
    shouldShowPayButton: boolean;
};

function ApproveActionButton({iouReportID, startApprovedAnimation, onHoldMenuOpen, shouldShowPayButton}: ApproveActionButtonProps) {
    const {translate} = useLocalize();
    const {canApprove} = usePermissions();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [policy] = usePolicy(report?.policyID);
    const [delegateEmail] = useOnyx(ONYXKEYS.SESSION.delegateEmail);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [personalDetailsList] = useOnyx<PersonalDetailsList>(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const {isDelegateAccess} = useDelegateNoAccessState();

    if (!canApprove || !report || !iouReportID || !policy) {
        return null;
    }

    const isCurrentUserSubmitter = currentUserPersonalDetails.accountID === report.managerID || delegateEmail === report.managerID;
    const hasHeldExpenses = hasHeldExpensesReportUtils(report);
    const hasViolations = hasViolationsReportUtils(report);
    const shouldShowHoldMenu = hasHeldExpenses || hasViolations;

    const handleApprovePress = () => {
        if (shouldShowHoldMenu) {
            onHoldMenuOpen(CONST.IOU.REQUEST_TYPE.MONEY_REQUEST, undefined, shouldShowPayButton);
            return;
        }

        const {total, unheldTotal} = getNonHeldAndFullAmount(report, shouldShowPayButton);
        approveMoneyRequest(iouReportID, total, unheldTotal, startApprovedAnimation);
    };

    if (isDelegateAccess && !isCurrentUserSubmitter) {
        return null;
    }

    return (
        <Button
            success
            onPress={handleApprovePress}
            text={translate('common.approve')}
            style={[{marginBottom: 8}]}
            pressOnEnter
        />
    );
}

export default ApproveActionButton;