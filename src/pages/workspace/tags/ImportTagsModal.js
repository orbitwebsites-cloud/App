import React, {useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import * as Policy from '../../../libs/actions/Policy';
import ImportTagsStep from './ImportTagsStep';
import TagListStep from './TagListStep';
import TagMappingStep from './TagMappingStep';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';

const propTypes = {
    /** Policy tags */
    policyTags: PropTypes.shape({
        tags: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                enabled: PropTypes.bool,
            }),
        ),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    policyTags: {},
};

const STEPS = {
    IMPORT: 'IMPORT',
    MAPPING: 'MAPPING',
    LIST: 'LIST',
};

function ImportTagsModal({policyTags, translate}) {
    const [currentStep, setCurrentStep] = useState(STEPS.IMPORT);
    const [importedTags, setImportedTags] = useState([]);
    const [mappedColumn, setMappedColumn] = useState(null);
    const [enabledTags, setEnabledTags] = useState({});

    const handleImport = (tags) => {
        setImportedTags(tags);
        setCurrentStep(STEPS.MAPPING);
    };

    const handleMapping = (column) => {
        setMappedColumn(column);
        const initialEnabledState = {};
        importedTags.forEach((tag) => {
            // When importing tags, preserve the enabled status from the uploaded file or default to true if not specified
            initialEnabledState[tag.name] = tag.enabled !== false;
        });
        setEnabledTags(initialEnabledState);
        setCurrentStep(STEPS.LIST);
    };

    const handleTagToggle = (tagName) => {
        setEnabledTags((prev) => ({
            ...prev,
            [tagName]: !prev[tagName],
        }));
    };

    const handleFinalImport = () => {
        const tagsToImport = importedTags.map((tag) => ({
            name: tag[mappedColumn],
            enabled: enabledTags[tag[mappedColumn]] ?? true,
        }));

        Policy.importPolicyTags(policyTags.id, tagsToImport);
    };

    const goBack = () => {
        if (currentStep === STEPS.MAPPING) {
            setCurrentStep(STEPS.IMPORT);
        } else if (currentStep === STEPS.LIST) {
            setCurrentStep(STEPS.MAPPING);
        }
    };

    return (
        <ScreenWrapper testID={ImportTagsModal.displayName}>
            <HeaderWithBackButton title={translate('workspace.tags.importTags')} onBackButtonPress={goBack} />
            <View style={[styles.flex1, styles.w100, styles.p5]}>
                {currentStep === STEPS.IMPORT && <ImportTagsStep onImport={handleImport} />}
                {currentStep === STEPS.MAPPING && <TagMappingStep tags={importedTags} onMapping={handleMapping} />}
                {currentStep === STEPS.LIST && (
                    <TagListStep
                        tags={importedTags.map((tag) => ({
                            name: tag[mappedColumn],
                            enabled: enabledTags[tag[mappedColumn]],
                        }))}
                        onToggle={handleTagToggle}
                        onImport={handleFinalImport}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

ImportTagsModal.propTypes = propTypes;
ImportTagsModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        policyTags: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${route.params.policyID}`,
        },
    }),
)(ImportTagsModal);