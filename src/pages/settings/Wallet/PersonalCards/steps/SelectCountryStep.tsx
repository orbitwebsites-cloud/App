import React, {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {Country} from '@libs/PhoneNumberUtils/types';
import * as PersonalCardUtils from '@libs/PersonalCardUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CountryListItem} from './types';

type SelectCountryStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD.ADDRESS_COUNTRY>;

function SelectCountryStep({route}: SelectCountryStepProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const [selectedCountry, setSelectedCountry] = useState('');
    const [errors, setErrors] = useState<{country?: string}>({});
    const [isCountrySelected, setIsCountrySelected] = useState(false);
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY_BY_IP);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [walletAdditionalData] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DATA);
    const flashListRef = useRef(null);

    const policyID = route.params?.policyID ?? '';

    const countryList = useMemo(() => {
        const countryOptions = PersonalCardUtils.getCountryListForSelection(currencyList);
        return Object.entries(countryOptions).map(([countryCode, countryName]) => ({
            value: countryCode,
            text: countryName,
            keyForList: countryCode,
            isSelected: selectedCountry === countryCode,
        }));
    }, [currencyList, selectedCountry]);

    const initiallyFocusedIndex = useMemo(() => {
        if (!selectedCountry) {
            return 0;
        }
        return countryList.findIndex((country) => country.value === selectedCountry);
    }, [countryList, selectedCountry]);

    const getCountry = useCallback((): string => {
        if (walletAdditionalData?.bankAccountCountry) {
            return walletAdditionalData.bankAccountCountry;
        }
        if (personalDetails && Object.keys(personalDetails).length > 0) {
            const firstDetail = Object.values(personalDetails)[0];
            if (firstDetail?.address?.country) {
                return firstDetail.address.country;
            }
        }
        return countryByIp ?? '';
    }, [countryByIp, personalDetails, walletAdditionalData?.bankAccountCountry]);

    useEffect(() => {
        const country = getCountry();
        if (country && ValidationUtils.isValidCountry(country)) {
            setSelectedCountry(country);
            setIsCountrySelected(true);
            setErrors({});
        } else {
            setSelectedCountry('');
            setIsCountrySelected(false);
        }
    }, [getCountry]);

    const selectCountry = (country: CountryListItem) => {
        const countryCode = country.value;
        if (!ValidationUtils.isValidCountry(countryCode)) {
            setErrors({country: translate('personalDetails.error.country')});
            setIsCountrySelected(false);
            return;
        }
        setErrors({});
        setSelectedCountry(countryCode);
        setIsCountrySelected(true);
    };

    const navigateBack = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_ADD_EDIT.route);
    };

    const navigateNext = () => {
        if (!isCountrySelected) {
            setErrors({country: translate('personalDetails.error.country')});
            return;
        }
        setErrors({});
        Card.setPersonalCardAddEditBankAccountStepAndData({
            country: selectedCountry,
            policyID,
        });
        Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_ADDRESS_LINE_1.getRoute(policyID));
    };

    return (
        <ScreenWrapper testID={SelectCountryStep.displayName}>
            <HeaderWithBackButton title={translate('personalCard.addressCountryStep.title')} onBackButtonPress={navigateBack} />
            <View style={[styles.flex1, styles.w100]}>
                <View style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasisAuto, styles.ph5]}>
                    <Text style={[styles.textNormal, styles.colorNormal, styles.mb6]}>{translate('personalCard.addressCountryStep.subtitle')}</Text>
                    <SelectionList
                        ref={flashListRef}
                        headerMessage=""
                        sections={[{data: countryList, indexOffset: 0}]}
                        textInputValue={selectedCountry}
                        onSelectRow={selectCountry}
                        initiallyFocusedIndex={initiallyFocusedIndex}
                        showScrollIndicator
                        hideSectionHeaders
                        ListItem={RadioListItem}
                        listHeaderContent={<View style={styles.pb4} />}
                    />
                    <FormHelpMessage
                        style={[styles.mt2, styles.mh0]}
                        isError={!!errors.country}
                        message={errors.country}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

SelectCountryStep.displayName = 'SelectCountryStep';

export default SelectCountryStep;