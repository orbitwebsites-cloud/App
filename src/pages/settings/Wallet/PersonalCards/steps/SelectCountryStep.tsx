import React, {useState} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPlaidCountry} from '@libs/CardUtils';
import searchOptions from '@libs/searchOptions';
import type {Option} from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import Navigation from '@navigation/Navigation';
import {clearAddNewPersonalCardFlow, setAddNewPersonalCardStepAndData} from '@userActions/PersonalCards';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function SelectCountryStep({disableAutoFocus}: {disableAutoFocus?: boolean}) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const [currencyList, currencyListMeta] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const [countryByIp, countryByIpMeta] = useOnyx(ONYXKEYS.COUNTRY);
    const [addNewPersonalCard] = useOnyx(ONYXKEYS.ADD_NEW_PERSONAL_CARD);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currency = currentUserPersonalDetails?.localCurrencyCode ?? CONST.CURRENCY.USD;
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const isLoading = isLoadingOnyxValue(currencyListMeta, countryByIpMeta);
    const reasonAttributes = {context: 'SelectCountryStep', isLoading};

    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const currentCountry = selectedCountry ?? addNewPersonalCard?.data?.selectedCountry ?? getPlaidCountry(currency, currencyList, countryByIp);
    const [hasError, setHasError] = useState(false);
    const isUS = currentCountry === CONST.COUNTRY.US;

    const submit = () => {
        if (!currentCountry || !CONST.PLAID_SUPPORT_COUNTRIES.includes(currentCountry)) {
            setHasError(true);
        } else {
            if (addNewPersonalCard?.data.selectedCountry !== currentCountry) {
                clearAddNewPersonalCardFlow();
            }
            setAddNewPersonalCardStepAndData({
                step: isUS ? CONST.PERSONAL_CARDS.STEP.SELECT_BANK : CONST.PERSONAL_CARDS.STEP.PLAID_CONNECTION,
                data: {
                    selectedCountry: currentCountry,
                },
                isEditing: false,
            });
        }
    };

    const handleBackButtonPress = () => {
        Navigation.goBack();
    };

    const onSelectionChange = (country: Option) => {
        setSelectedCountry(country.value ?? null);
    };

    const getCountries = () =>
        CONST.PLAID_SUPPORT_COUNTRIES.map((countryISO) => {
            const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
            return {
                value: countryISO,
                keyForList: countryISO,
                text: countryName,
                isSelected: currentCountry === countryISO,
                searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
            };
        }).sort((a, b) => localeCompare(a.text, b.text));

    const countries = getCountries();

    const searchResults = searchOptions(debouncedSearchValue, countries);
    const headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    if (isLoading) {
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <ScreenWrapper
            testID="SelectCountryStep"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('personalCard.addPersonalCard')}
                onBackButtonPress={handleBackButtonPress}
            />

            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.whereIsYourBankLocated')}</Text>
            <SelectionList
                data={searchResults}
                ListItem={RadioListItem}
                onSelectRow={onSelectionChange}
                textInputOptions={{
                    headerMessage,
                    value: searchValue,
                    label: translate('common.search'),
                    onChangeText: setSearchValue,
                    disableAutoFocus,
                }}
                confirmButtonOptions={{
                    onConfirm: submit,
                    showButton: true,
                    text: translate('common.next'),
                }}
                initiallyFocusedItemKey={currentCountry}
                disableMaintainingScrollPosition
                shouldSingleExecuteRowSelect
                shouldUpdateFocusedIndex
                addBottomSafeAreaPadding
                shouldStopPropagation
            >
                {hasError && (
                    <View style={[styles.ph3, styles.mb3]}>
                        <FormHelpMessage
                            isError={hasError}
                            message={translate('workspace.companyCards.addNewCard.error.pleaseSelectCountry')}
                        />
                    </View>
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

export default SelectCountryStep;
