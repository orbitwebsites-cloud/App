import React, {useEffect, useRef} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'lodash';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../../../ONYXKEYS';
import CountryList from '../../../../components/CountryList';
import FullScreenLoadingIndicator from '../../../../components/FullscreenLoadingIndicator';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';

const CountrySelector = (props) => {
    const {selectedCountry, isLoading} = props;
    const scrollViewRef = useRef(null);

    useEffect(() => {
        if (!scrollViewRef.current || !selectedCountry) {
            return;
        }

        // Find the index of the selected country in the sorted country list
        const countryCodes = _.keys(props.countries);
        const sortedCountryCodes = _.sortBy(countryCodes, (code) => props.countries[code]);
        const selectedIndex = sortedCountryCodes.indexOf(selectedCountry);

        // If the country is not found, do nothing
        if (selectedIndex === -1) {
            return;
        }

        // Calculate approximate offset to scroll the selected country into view
        // 50 is approximate height of each country item
        const offset = selectedIndex * 50;

        // Scroll with a slight delay to ensure the list is rendered
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({y: offset, animated: true});
        }, 100);
    }, [selectedCountry, props.countries]);

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScrollView ref={scrollViewRef}>
            <View style={{flex: 1}}>
                <CountryList
                    countries={props.countries}
                    selectedCountry={selectedCountry}
                    onPress={props.onCountrySelected}
                />
            </View>
        </ScrollView>
    );
};

CountrySelector.propTypes = {
    ...withLocalizePropTypes,
    /** List of available countries */
    countries: PropTypes.objectOf(PropTypes.string).isRequired,
    /** Selected country */
    selectedCountry: PropTypes.string,
    /** Callback to fire when country is selected */
    onCountrySelected: PropTypes.func.isRequired,
    /** Whether the component is loading */
    isLoading: PropTypes.bool,
};

CountrySelector.defaultProps = {
    selectedCountry: '',
    isLoading: false,
};

export default compose(
    withLocalize,
    withOnyx({
        countries: {
            key: ONYXKEYS.COUNTRY_LIST,
        },
        isLoading: {
            key: ONYXKEYS.FORMS.BANK_ACCOUNT_FORM,
            selector: (form) => form?.isLoading,
        },
    }),
)(CountrySelector);