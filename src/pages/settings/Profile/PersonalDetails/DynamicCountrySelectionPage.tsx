import React, {useCallback, useMemo, useState, useRef} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {Option} from '@libs/searchOptions';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import {appendParam} from '@libs/Url';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import useThemeStyles from '@hooks/useThemeStyles';
import FormHelpMessage from '@components/FormHelpMessage';
import * as ValidationUtils from '@libs/ValidationUtils';

type DynamicCountrySelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.DYNAMIC_ADDRESS_COUNTRY>;

function DynamicCountrySelectionPage({route}: DynamicCountrySelectionPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {onSuccessData, titleKey, backTo, route: routeParam, value: valueFromParams} = route.params;
    const [searchValue, setSearchValue] = useState('');
    const [errors, setErrors] = useState<{country?: string}>({});
    const flashListRef = useRef(null);

    const selectCountry = useCallback(
        (option: Option) => {
            if (!option.value || !ValidationUtils.isValidCountry(option.value)) {
                setErrors({country: translate('personalDetails.error.country')});
                return;
            }
            setErrors({});
            const successData = {...onSuccessData, [routeParam]: option.value};
            Navigation.goBack(backTo);
            Navigation.setParams(successData, routeKey);
        },
        [onSuccessData, backTo, routeParam, translate],
    );

    const countryOptions = useMemo(() => {
        const options = searchOptions.getCountryListForSelection();
        return options.map((option) => ({
            ...option,
            keyForList: option.value,
            isSelected: option.value === valueFromParams,
        }));
    }, [valueFromParams]);

    const initiallyFocusedIndex = useMemo(() => {
        if (!valueFromParams) {
            return 0;
        }
        return countryOptions.findIndex((option) => option.value === valueFromParams);
    }, [countryOptions, valueFromParams]);

    const filteredOptions = useMemo(() => {
        if (!searchValue) {
            return countryOptions;
        }
        return countryOptions.filter((option) => StringUtils.matchSearchTerm(option.text ?? '', searchValue));
    }, [countryOptions, searchValue]);

    const title = translate(titleKey as TranslationPaths);
    const routeKey = Navigation.getActiveRouteWithoutParams();

    useDynamicBackPath(backTo);

    return (
        <ScreenWrapper testID={DynamicCountrySelectionPage.displayName}>
            <HeaderWithBackButton title={title} />
            <View style={[styles.flex1, styles.w100]}>
                <View style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasisAuto, styles.ph5]}>
                    <SelectionList
                        ref={flashListRef}
                        sections={[{data: filteredOptions, indexOffset: 0}]}
                        textInputValue={searchValue}
                        onChangeText={setSearchValue}
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

DynamicCountrySelectionPage.displayName = 'DynamicCountrySelectionPage';

export default DynamicCountrySelectionPage;