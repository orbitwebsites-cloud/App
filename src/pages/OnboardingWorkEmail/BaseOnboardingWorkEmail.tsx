import {useIsFocused} from '@react-navigation/native';
import {PUBLIC_DOMAINS_SET, Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import AutoEmailLink from '@components/AutoEmailLink';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import OnboardingMergingAccountBlockedView from '@components/OnboardingMergingAccountBlockedView';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingStepCounter from '@hooks/useOnboardingStepCounter';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TranslationPaths} from '@src/languages/types';
import type {OnboardingWorkEmailProps} from './types';

function BaseOnboardingWorkEmail({route, shouldUseNativeStyles = false}: OnboardingWorkEmailProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const isFocused = useIsFocused();
    const {inputCallbackRef} = useAutoFocusInput();
    const [onboardingStepCounter] = useOnyx(ONYXKEYS.ONBOARDING_STEP_COUNTER);
    const [onboardingData] = useOnyx(ONYXKEYS.ONBOARDING_DATA);
    const [onboardingErrorMessage, setOnboardingErrorMessage] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE);
    const [isMergingAccountBlocked, setIsMergingAccountBlocked] = useOnyx(ONYXKEYS.IS_MERGING_ACCOUNT_BLOCKED);
    const {isOffline} = useNetwork();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const {isAnonymousUser} = useOnyx(ONYXKEYS.SESSION);
    const {nextScreen} = route.params ?? {};

    const onyxError = ErrorUtils.getLatestOnyxError(ONYXKEYS.NVP_ONBOARDING);
    const hasError = Boolean(onyxError?.message || onboardingErrorMessage);

    const onboardingIllustrations = useMemoizedLazyIllustrations('onboarding-illustrations');

    const validateEmail = useCallback((value: string): boolean => {
        const trimmedValue = value.trim();
        const isValid = Str.isValidEmail(trimmedValue) && !PUBLIC_DOMAINS_SET.has(trimmedValue.split('@')[1]?.toLowerCase());
        setIsEmailValid(isValid);
        return isValid;
    }, []);

    const onSubmit = useCallback(() => {
        if (!validateEmail(email)) {
            return;
        }

        setIsSubmitting(true);
        Session.addWorkEmail(email)
            .then((response) => {
                if (response?.jsonCode === CONST.JSON_CODE.SUCCESS) {
                    setIsMergingAccountBlocked(false);
                    setOnboardingErrorMessage('');
                    Navigation.navigate(nextScreen ?? ROUTES.SETTINGS_PROFILE);
                } else {
                    // Only set the specific error message if it's provided by the backend
                    const errorMessage = response?.message;
                    if (errorMessage && typeof errorMessage === 'string') {
                        setOnboardingErrorMessage(errorMessage);
                    } else {
                        setOnboardingErrorMessage('onboarding.purpose.error');
                    }
                    setIsMergingAccountBlocked(true);
                }
            })
            .catch((error) => {
                console.error('[OnboardingWorkEmail] Error adding work email', error);
                setOnboardingErrorMessage('onboarding.purpose.error');
                setIsMergingAccountBlocked(true);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }, [email, validateEmail, nextScreen, setIsMergingAccountBlocked, setOnboardingErrorMessage]);

    const clearErrorAndNavigateBack = useCallback(() => {
        setOnboardingErrorMessage('');
        Navigation.goBack();
    }, [setOnboardingErrorMessage]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        // Clear any previous error when navigating back to this screen
        setOnboardingErrorMessage('');
        setIsMergingAccountBlocked(false);
    }, [isFocused, setOnboardingErrorMessage, setIsMergingAccountBlocked]);

    const headerTitle = translate('common.workEmail');
    const subtitle = translate('onboarding.enterWorkEmail');
    const submitButtonText = translate('common.continue');
    const emailInputLabel = translate('common.workEmail');
    const errorContent = useMemo(() => {
        if (!hasError) {
            return null;
        }

        // If we have a specific backend message that includes "Two-Factor Authentication (2FA)", show a tailored message
        if (onboardingErrorMessage?.includes('Two-Factor Authentication (2FA)')) {
            return (
                <Text style={[styles.formError, styles.mt2]}>
                    {onboardingErrorMessage}
                </Text>
            );
        }

        // Otherwise, fall back to generic error
        const errorMessageKey = (onboardingErrorMessage ?? 'onboarding.purpose.error') as TranslationPaths;
        return (
            <Text style={[styles.formError, styles.mt2]}>
                {translate(errorMessageKey)}
            </Text>
        );
    }, [hasError, onboardingErrorMessage, styles, translate]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={BaseOnboardingWorkEmail.displayName}
            shouldEnableMaxWidth
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={clearErrorAndNavigateBack}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM}
                submitButtonText={submitButtonText}
                onSubmit={onSubmit}
                isSubmitButtonVisible={false}
                style={[styles.flexGrow1, styles.ph5]}
            >
                <View style={[styles.flexGrow1, styles.justifyContentBetween]}>
                    <View>
                        <Text style={[styles.textHeadlineLineHeightXXL, styles.mv5, styles.textAlignCenter]}>{subtitle}</Text>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="email"
                            label={emailInputLabel}
                            aria-label={emailInputLabel}
                            role={CONST.ROLE.PRESENTATION}
                            value={email}
                            onChangeText={(value) => {
                                setEmail(value);
                                if (hasError) {
                                    setOnboardingErrorMessage('');
                                }
                            }}
                            onKeyPress={() => {
                                if (hasError) {
                                    setOnboardingErrorMessage('');
                                }
                            }}
                            ref={inputCallbackRef}
                            errorText={!isEmailValid ? translate('common.error.invalidEmail') : ''}
                            onBlur={() => validateEmail(email)}
                            onSubmitEditing={onSubmit}
                            autoCapitalize="none"
                            autoCompleteType="email"
                            textContentType="emailAddress"
                            keyboardType="email-address"
                            disabled={isSubmitting}
                        />
                        {errorContent}
                    </View>
                    <View style={[styles.alignItemsCenter, styles.justifyContentEnd, styles.mb8]}>
                        <Button
                            success
                            isDisabled={!isEmailValid || isSubmitting || isOffline}
                            isLoading={isSubmitting}
                            onPress={onSubmit}
                            pressOnEnter
                            text={submitButtonText}
                            style={[styles.mb2]}
                        />
                        <AutoEmailLink
                            style={[styles.mt2, styles.textAlignCenter]}
                            textStyles={[styles.textMicro]}
                        />
                    </View>
                </View>
            </FormProvider>
            <OfflineWithFeedback
                isOpen={isMergingAccountBlocked ?? false}
                onClose={() => setIsMergingAccountBlocked(false)}
                errorContent={<OnboardingMergingAccountBlockedView onDismiss={() => setIsMergingAccountBlocked(false)} />}
                shouldShowOfflineIndicator={false}
                containerStyle={styles.pb0}
            />
        </ScreenWrapper>
    );
}

BaseOnboardingWorkEmail.displayName = 'BaseOnboardingWorkEmail';

export default BaseOnboardingWorkEmail;