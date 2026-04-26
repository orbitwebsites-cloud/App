import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Text from '../../../components/Text';
import TextInput from '../../../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import ONYXKEYS from '../../../ONYXKEYS';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import * as PolicyUtils from '../../../libs/PolicyUtils';
import Form from '../../../components/Form';
import formPropTypes from '../../../components/Form/formPropTypes';
import CONST from '../../../CONST';
import AddressForm from '../AddressForm';

const propTypes = {
    ...formPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
};

function ReimbursementAccountForm(props) {
    const [formValues, setFormValues] = useState({
        companyWebsite: '',
        companyPhone: '',
        companyAddress: '',
        companyType: '',
        incorporationDate: '',
        incorporationState: '',
        companyTaxID: '',
        companyName: '',
        companyClassificationCode: '', // Ensure this is initialized as empty string
    });

    useEffect(() => {
        if (!props.reimbursementAccount) {
            return;
        }
        const bankAccount = props.reimbursementAccount;
        setFormValues({
            companyWebsite: bankAccount.companyWebsite || '',
            companyPhone: bankAccount.companyPhone || '',
            companyAddress: bankAccount.companyAddress || '',
            companyType: bankAccount.companyType || '',
            incorporationDate: bankAccount.incorporationDate || '',
            incorporationState: bankAccount.incorporationState || '',
            companyTaxID: bankAccount.companyTaxID || '',
            companyName: bankAccount.companyName || '',
            companyClassificationCode: bankAccount.companyClassificationCode || '', // Ensure no prefilled value
        });
    }, [props.reimbursementAccount]);

    return (
        <ScreenWrapper>
            <HeaderWithBackButton title="Business Info" />
            <Form
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                submitButtonText="Continue"
                onSubmit={(values) => {
                    BankAccounts.updateReimbursementAccountDraft(values);
                }}
                validate={(values) => {
                    const errors = {};
                    if (!values.companyName) {
                        errors.companyName = 'This field is required.';
                    }
                    if (!values.companyTaxID) {
                        errors.companyTaxID = 'This field is required.';
                    }
                    if (!values.companyPhone) {
                        errors.companyPhone = 'This field is required.';
                    }
                    if (!values.companyAddress) {
                        errors.companyAddress = 'This field is required.';
                    }
                    if (!values.companyType) {
                        errors.companyType = 'This field is required.';
                    }
                    if (!values.incorporationDate) {
                        errors.incorporationDate = 'This field is required.';
                    }
                    if (!values.incorporationState) {
                        errors.incorporationState = 'This field is required.';
                    }
                    if (!values.companyClassificationCode) {
                        errors.companyClassificationCode = 'This field is required.';
                    }
                    return errors;
                }}
                scrollContextEnabled
            >
                <View>
                    <TextInput
                        label="Company Name"
                        name="companyName"
                        value={formValues.companyName}
                        onChangeText={(value) => setFormValues({...formValues, companyName: value})}
                        errorText={props.errors.companyName}
                        onBlur={() => props.clearErrorField('companyName')}
                    />
                    <TextInput
                        label="Company Tax ID"
                        name="companyTaxID"
                        value={formValues.companyTaxID}
                        onChangeText={(value) => setFormValues({...formValues, companyTaxID: value})}
                        errorText={props.errors.companyTaxID}
                        onBlur={() => props.clearErrorField('companyTaxID')}
                    />
                    <TextInput
                        label="Company Website"
                        name="companyWebsite"
                        value={formValues.companyWebsite}
                        onChangeText={(value) => setFormValues({...formValues, companyWebsite: value})}
                        errorText={props.errors.companyWebsite}
                        onBlur={() => props.clearErrorField('companyWebsite')}
                    />
                    <TextInput
                        label="Company Phone"
                        name="companyPhone"
                        value={formValues.companyPhone}
                        onChangeText={(value) => setFormValues({...formValues, companyPhone: value})}
                        errorText={props.errors.companyPhone}
                        onBlur={() => props.clearErrorField('companyPhone')}
                    />
                    <AddressForm
                        address={formValues.companyAddress}
                        onAddressChange={(address) => setFormValues({...formValues, companyAddress: address})}
                        error={props.errors.companyAddress}
                        clearError={() => props.clearErrorField('companyAddress')}
                    />
                    <TextInput
                        label="Company Type"
                        name="companyType"
                        value={formValues.companyType}
                        onChangeText={(value) => setFormValues({...formValues, companyType: value})}
                        errorText={props.errors.companyType}
                        onBlur={() => props.clearErrorField('companyType')}
                    />
                    <TextInput
                        label="Incorporation Date"
                        name="incorporationDate"
                        value={formValues.incorporationDate}
                        onChangeText={(value) => setFormValues({...formValues, incorporationDate: value})}
                        errorText={props.errors.incorporationDate}
                        onBlur={() => props.clearErrorField('incorporationDate')}
                    />
                    <TextInput
                        label="Incorporation State"
                        name="incorporationState"
                        value={formValues.incorporationState}
                        onChangeText={(value) => setFormValues({...formValues, incorporationState: value})}
                        errorText={props.errors.incorporationState}
                        onBlur={() => props.clearErrorField('incorporationState')}
                    />
                    <TextInput
                        label="Company Classification Code"
                        name="companyClassificationCode"
                        value={formValues.companyClassificationCode}
                        onChangeText={(value) => setFormValues({...formValues, companyClassificationCode: value})}
                        errorText={props.errors.companyClassificationCode}
                        onBlur={() => props.clearErrorField('companyClassificationCode')}
                        placeholder=""
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

ReimbursementAccountForm.propTypes = propTypes;
ReimbursementAccountForm.defaultProps = defaultProps;

export default withLocalize(
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        errors: {
            key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM,
            selector: (reimbursementAccountForm) => reimbursementAccountForm?.errors,
        },
    })(ReimbursementAccountForm),
);