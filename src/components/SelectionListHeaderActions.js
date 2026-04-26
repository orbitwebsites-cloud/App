import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import CONST from 'src/CONST';
import Button from './Button';

const SelectionListHeaderActions = (props) => {
    const {
        selectedItems,
        allItems,
        onAction,
        actionLabel,
        showApproveAction,
        showPayAction,
        showSubmitAction,
    } = props;

    // Check if all expenses are selected
    const areAllExpensesSelected = selectedItems.length > 0 && selectedItems.length === allItems.length;

    // If not all expenses are selected, only show the clear selection button
    if (!areAllExpensesSelected) {
        return (
            <View style={[CONST.STYLES.BUTTON_WRAPPER]}>
                <Button
                    text="Clear"
                    onPress={() => onAction(CONST.SELECTION_LIST_ACTION.CLEAR)}
                    medium
                />
            </View>
        );
    }

    // If all expenses are selected, show the primary report action (Submit/Approve/Pay)
    return (
        <View style={[CONST.STYLES.BUTTON_WRAPPER]}>
            {showSubmitAction && (
                <Button
                    text={actionLabel}
                    onPress={() => onAction(CONST.SELECTION_LIST_ACTION.SUBMIT)}
                    success
                    medium
                />
            )}
            {showApproveAction && (
                <Button
                    text={actionLabel}
                    onPress={() => onAction(CONST.SELECTION_LIST_ACTION.APPROVE)}
                    success
                    medium
                />
            )}
            {showPayAction && (
                <Button
                    text={actionLabel}
                    onPress={() => onAction(CONST.SELECTION_LIST_ACTION.PAY)}
                    success
                    medium
                />
            )}
            <Button
                text="Clear"
                onPress={() => onAction(CONST.SELECTION_LIST_ACTION.CLEAR)}
                medium
            />
        </View>
    );
};

SelectionListHeaderActions.propTypes = {
    /** List of selected items */
    selectedItems: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** All items in the list */
    allItems: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Callback to fire when an action is selected */
    onAction: PropTypes.func.isRequired,

    /** Label for the primary action button */
    actionLabel: PropTypes.string.isRequired,

    /** Whether to show the approve action */
    showApproveAction: PropTypes.bool,

    /** Whether to show the pay action */
    showPayAction: PropTypes.bool,

    /** Whether to show the submit action */
    showSubmitAction: PropTypes.bool,
};

SelectionListHeaderActions.defaultProps = {
    showApproveAction: false,
    showPayAction: false,
    showSubmitAction: false,
};

export default SelectionListHeaderActions;