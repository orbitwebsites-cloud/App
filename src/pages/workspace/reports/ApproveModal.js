import React, {useCallback, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Modal from '../../../components/Modal';
import ONYXKEYS from '../../../ONYXKEYS';
import Button from '../../../components/Button';
import Text from '../../../components/Text';
import useLocalize from '../../../hooks/useLocalize';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import * as Report from '../../../libs/actions/Report';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';

const propTypes = {
    /** Whether the modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** The report being approved */
    report: PropTypes.shape({
        reportID: PropTypes.string.isRequired,
        total: PropTypes.number,
        hasOutstandingIOU: PropTypes.bool,
        iouReportID: PropTypes.string,
    }).isRequired,

    /** All transactions associated with the report */
    transactions: PropTypes.objectOf(
        PropTypes.shape({
            transactionID: PropTypes.string,
            amount: PropTypes.number,
            currency: PropTypes.string,
            modifiedAmount: PropTypes.number,
            modifiedCurrency: PropTypes.string,
            parentTransactionID: PropTypes.string,
            reimbursementHold: PropTypes.bool,
            isPartialExpense: PropTypes.bool,
        }),
    ).isRequired,

    /** All transactionIDs in the report */
    transactionIDs: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** All reports for this user */
    reports: PropTypes.objectOf(
        PropTypes.shape({
            reportID: PropTypes.string,
            stateNum: PropTypes.number,
            statusNum: PropTypes.number,
        }),
    ),

    /** Callback to close the modal */
    onClose: PropTypes.func.isRequired,
};

const defaultProps = {
    reports: {},
};

function ApproveModal({isVisible, report, transactions, transactionIDs, reports, onClose}) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    // Filter transactions for this report and extract relevant data
    const reportTransactions = useMemo(() => {
        if (!transactionIDs || !transactions) return [];
        return transactionIDs.map((id) => transactions[id]).filter(Boolean);
    }, [transactionIDs, transactions]);

    // Calculate held amount (expenses on hold)
    const heldAmount = useMemo(() => {
        if (!reportTransactions.length) return 0;
        return _.reduce(
            reportTransactions,
            (sum, transaction) => {
                if (!transaction || !transaction.reimbursementHold) return sum;
                const amount = CurrencyUtils.convertToWholeUnit(transaction.amount, transaction.currency);
                return sum + amount;
            },
            0,
        );
    }, [reportTransactions]);

    // Calculate total report amount (excluding holds)
    const nonHeldTotal = useMemo(() => {
        if (!reportTransactions.length) return 0;
        return _.reduce(
            reportTransactions,
            (sum, transaction) => {
                if (!transaction || transaction.reimbursementHold) return sum;
                const amount = CurrencyUtils.convertToWholeUnit(transaction.amount, transaction.currency);
                return sum + amount;
            },
            0,
        );
    }, [reportTransactions]);

    // Determine if all expenses are held
    const allHeld = useMemo(() => {
        if (!reportTransactions.length) return false;
        return _.every(reportTransactions, (transaction) => transaction && transaction.reimbursementHold);
    }, [reportTransactions]);

    // Determine if any expense is held
    const hasHeldExpenses = useMemo(() => {
        if (!reportTransactions.length) return false;
        return _.some(reportTransactions, (transaction) => transaction && transaction.reimbursementHold);
    }, [reportTransactions]);

    // Format amount for display
    const formatAmount = useCallback(
        (amount) => {
            return amount === 0 ? '0.00' : CurrencyUtils.convertToDisplayString(Math.abs(amount), 'USD');
        },
        [],
    );

    // Handle full approval (approve all including held items)
    const approveAll = useCallback(() => {
        Report.approveReport(report.reportID);
        onClose();
    }, [report.reportID, onClose]);

    // Handle partial approval (approve only non-held items)
    const approvePartial = useCallback(() => {
        Report.approveReport(report.reportID, false);
        onClose();
    }, [report.reportID, onClose]);

    // Reset state when modal closes
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    // Show different modal content based on state
    const modalContent = useMemo(() => {
        // When all expenses are held, show special message
        if (allHeld) {
            return {
                title: translate('iou.approveBill'),
                subtitle: translate('iou.confirmApprovalAllHoldAmount'),
                buttons: [
                    {
                        text: translate('common.approve'),
                        onPress: approveAll,
                        success: true,
                        amount: formatAmount(heldAmount),
                    },
                ],
            };
        }

        // When some expenses are held, show both options
        if (hasHeldExpenses) {
            return {
                title: translate('iou.approveBill'),
                subtitle: translate('iou.confirmApprovalPartial'),
                buttons: [
                    {
                        text: translate('iou.approvePartial'),
                        onPress: approvePartial,
                        amount: formatAmount(nonHeldTotal),
                    },
                    {
                        text: translate('common.approve'),
                        onPress: approveAll,
                        success: true,
                        amount: formatAmount(report.total || 0),
                    },
                ],
            };
        }

        // When no expenses are held
        return {
            title: translate('iou.approveBill'),
            subtitle: translate('iou.confirmApproval'),
            buttons: [
                {
                    text: translate('common.approve'),
                    onPress: approveAll,
                    success: true,
                    amount: formatAmount(report.total || 0),
                },
            ],
        };
    }, [
        allHeld,
        hasHeldExpenses,
        translate,
        approveAll,
        approvePartial,
        formatAmount,
        heldAmount,
        nonHeldTotal,
        report.total,
    ]);

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={handleClose}
            onClose={handleClose}
            innerContainerStyle={isSmallScreenWidth ? {padding: 20} : {}}
        >
            <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 12}}>{modalContent.title}</Text>
            <Text style={{marginBottom: 20}}>{modalContent.subtitle}</Text>
            {_.map(modalContent.buttons, (button, index) => (
                <Button
                    key={index}
                    text={button.text}
                    onPress={button.onPress}
                    success={button.success}
                    variant={button.success ? 'success' : 'primary'}
                    // Only show amount if it's not zero
                    textAdditionalStyles={button.amount !== '0.00' ? {marginRight: 8} : {}}
                    PressableComponentProps={{
                        style: {flexDirection: 'row', justifyContent: 'space-between'},
                    }}
                >
                    {button.amount !== '0.00' && <Text style={{fontWeight: 'bold'}}>{button.amount}</Text>}
                </Button>
            ))}
        </Modal>
    );
}

ApproveModal.propTypes = propTypes;
ApproveModal.defaultProps = defaultProps;

export default withOnyx({
    transactions: {
        key: ONYXKEYS.COLLECTION.TRANSACTION,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(ApproveModal);