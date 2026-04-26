import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import useLocalize from '../../hooks/useLocalize';
import useNetwork from '../../hooks/useNetwork';
import usePrevious from '../../hooks/usePrevious';
import useThemeStyles from '../../hooks/useThemeStyles';
import compose from '../../libs/compose';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import * as ErrorUtils from '../../libs/ErrorUtils';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import * as Policy from '../../libs/actions/Policy';
import * as Report from '../../libs/actions/Report';
import * as User from '../../libs/actions/User';
import ONYXKEYS from '../../ONYXKEYS';
import type {PolicyMember, PrivatePersonalDetails} from '../../types/onyx';
import type {WithNavigationProps} from '../../types/utils';
import withNavigationFocus from '../../components/withNavigationFocus';
import CONST from '../../CONST';
import FixedFooter from '../../components/FixedFooter';
import MultipleAvatars from '../../components/MultipleAvatars';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import OptionSelector from '../../components/OptionSelector';
import SearchInput from '../../components/SearchInput';
import Text from '../../components/Text';
import useSingleExecution from '../../hooks/useSingleExecution';
import Navigation from '../../libs/Navigation/Navigation';
import {isEmptyObject} from '../../libs/ObjectUtils';
import * as DeprecatedPolicy from '../../libs/actions/DeprecatedPolicy';

type InvitePageOnyxProps = {
    /** Personal details of all the users */
    personalDetails: OnyxEntry<PrivatePersonalDetails>;

    /** All of the personal details for everyone */
    personalDetailsList: OnyxEntry<Record<string, {accountID: number; displayName: string; avatar: string; login: string}>>;

    /** All of the policy members */
    policyMembers: OnyxEntry<Record<string, PolicyMember>>;

    /** The policy ID currently being configured */
    policyID: OnyxEntry<string>;

    /** The policy object for the current route */
    policy: OnyxEntry<Policy>;
};

type InvitePageProps = InvitePageOnyxProps & WithNavigationProps & typeof withLocalizePropTypes;

function InvitePage({
    policyMembers = {},
    policyID = '',
    policy,
    personalDetails = {},
    personalDetailsList = {},
    translate,
    navigation,
}: InvitePageProps) {
    const styles = useThemeStyles();
    const {translateLocal} = useLocalize();
    const {isOffline} = useNetwork();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<ReportUtils.OptionData[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSearchingForUser, setIsSearchingForUser] = useState(false);
    const [isInviteProcessing, setIsInviteProcessing] = useState(false);
    const [numberOfRecipients, setNumberOfRecipients] = useState(0);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const {singleExecution, isExecuting} = useSingleExecution();
    const previousIsOffline = usePrevious(isOffline);

    const policyExpenseChatReport = useMemo(() => ReportUtils.getPolicyExpenseChatByPolicyIDAndOwner(policyID, currentUserAccountID), [policyID, currentUserAccountID]);
    const participants = useMemo(() => ReportUtils.getVisibleMemberIDs(policyExpenseChatReport.reportID), [policyExpenseChatReport]);
    const currentUserAccountID = useMemo(() => User.getCurrentUserAccountID(), []);
    const participantPersonalDetails = useMemo(
        () => _.pick(personalDetails, (details) => details?.accountID && participants.includes(details.accountID)),
        [personalDetails, participants],
    );

    // We need to exclude already invited users and the currently logged in user from the search results
    const excludeLogins = useMemo(() => {
        const invitedUserLogins = _.keys(policyMembers);
        return [...invitedUserLogins, currentUserLogin];
    }, [policyMembers, currentUserLogin]);

    const currentUserLogin = useMemo(() => {
        const currentUserDetails = personalDetails[currentUserAccountID];
        return currentUserDetails?.login ?? '';
    }, [personalDetails, currentUserAccountID]);

    const searchResults = useMemo(() => {
        if (!searchTerm) {
            return [];
        }

        const searchValue = searchTerm.trim();
        if (!ValidationUtils.isValidEmail(searchValue) && !ValidationUtils.isValidPhoneWithSpecialChars(searchValue)) {
            return [];
        }

        // Check if the search value is already selected
        const isAlreadySelected = _.some(selectedOptions, (option) => option.login === searchValue);
        if (isAlreadySelected) {
            return [];
        }

        // Check if the search value is already a policy member
        const isAlreadyMember = _.contains(excludeLogins, searchValue);
        if (isAlreadyMember) {
            return [];
        }

        return [
            {
                text: searchValue,
                login: searchValue,
                accountID: -1,
                avatar: ReportUtils.getDefaultAvatar(),
                isSelected: false,
                pendingAction: undefined,
                errors: undefined,
                brickRoadIndicator: undefined,
                boldStyle: false,
                subtitle: undefined,
                alternateText: undefined,
                keyForList: searchValue,
                isUnread: false,
                isPinned: false,
                hasDraftComment: false,
                reportID: undefined,
                phoneNumber: undefined,
                isChatRoom: false,
                isArchivedRoom: false,
                isPolicyExpenseChat: false,
                hasOutstandingIOU: false,
                iouReportID: undefined,
                hasViolations: false,
                welcomeMessage: undefined,
                notificationPreference: undefined,
                role: undefined,
                visibility: undefined,
                owner: undefined,
                type: CONST.REPORT.TYPE.IOU,
                isOwnPolicyExpenseChat: false,
                isExpenseReport: false,
                isTaskReport: false,
                isThread: false,
                isSubReport: false,
                parentReportID: undefined,
                parentReportActionID: undefined,
                lastActorAccountID: undefined,
                lastMessageText: undefined,
                lastReadTime: undefined,
                lastVisibleActionCreated: undefined,
                lastMentionedTime: undefined,
                hasReportName: false,
                reportName: undefined,
                stateNum: undefined,
                statusNum: undefined,
                hasECommerceOrders: false,
                isUserCreatedPolicyRoom: false,
                isOwnDomainRoom: false,
                policyID: undefined,
                oldPolicyName: undefined,
                isFromInvite: true,
            },
        ];
    }, [searchTerm, selectedOptions, excludeLogins]);

    const visibleOptions = useMemo(() => {
        const {personalDetails: currentPersonalDetails} = OptionsListUtils.getPersonalDetailsForDisplay({
            personalDetails: personalDetailsList,
            currentReportData: {},
            betas: [],
            excludeLogins,
            includeRecentReports: false,
            includeMultipleParticipantReports: false,
            includePersonalDetails: true,
            includeOwnedWorkspaceChats: false,
            includeP2P: false,
            excludeUnknownUsers: true,
            prioritizeIOUParticipants: false,
        });

        return _.map(currentPersonalDetails, (details) => {
            const isSelected = _.some(selectedOptions, (option) => option.accountID === details.accountID);
            return {
                ...details,
                isSelected,
                keyForList: String(details.accountID),
            };
        });
    }, [personalDetailsList, excludeLogins, selectedOptions]);

    const options = useMemo(() => {
        const sections = [];

        if (searchResults.length > 0) {
            sections.push({
                title: undefined,
                data: searchResults,
                shouldShow: true,
                indexOffset: 0,
            });
        }

        sections.push({
            title: translate('common.contacts'),
            data: visibleOptions,
            shouldShow: visibleOptions.length > 0,
            indexOffset: searchResults.length,
        });

        return {sections, selectedOptions};
    }, [searchResults, visibleOptions, translate]);

    useEffect(() => {
        if (!isOffline && previousIsOffline) {
            // Re-fetch personal details when coming back online
            PersonalDetails.fetchPersonalDetails();
        }
    }, [isOffline, previousIsOffline]);

    useEffect(() => {
        // Clear errors when selectedOptions change
        if (!_.isEmpty(errors)) {
            setErrors({});
        }
    }, [selectedOptions, errors]);

    useEffect(() => {
        setNumberOfRecipients(selectedOptions.length);
    }, [selectedOptions]);

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (selectedOptions.length === 0) {
            newErrors.noUserSelected = translate('workspace.invite.noUserSelected');
        }

        setErrors(newErrors);
        return _.isEmpty(newErrors);
    }, [selectedOptions, translate]);

    const resetData = useCallback(() => {
        setSearchTerm('');
        setSelectedOptions([]);
        setErrors({});
        setIsSearchingForUser(false);
        setIsInviteProcessing(false);
        setNumberOfRecipients(0);
    }, []);

    const inviteUser = useCallback(() => {
        if (!validate()) {
            return;
        }

        setIsInviteProcessing(true);

        // Use singleExecution to prevent multiple invitations
        singleExecution(() => {
            const invitePromises = _.map(selectedOptions, (option) => {
                if (option.login) {
                    return DeprecatedPolicy.inviteUserToWorkspace(policyID, option.login);
                }
                return Promise.resolve();
            });

            return Promise.allSettled(invitePromises)
                .then((results) => {
                    const failedInvites = _.filter(results, (result) => result.status === CONST.PROMISE_STATUS.REJECTED);
                    if (failedInvites.length > 0) {
                        setErrors({general: translate('workspace.invite.inviteFailed')});
                    } else {
                        resetData();
                        Navigation.goBack();
                    }
                })
                .finally(() => {
                    setIsInviteProcessing(false);
                });
        });
    }, [selectedOptions, validate, singleExecution, policyID, translate, resetData]);

    const headerTitle = translate('workspace.invite.invitePeople');
    const headerSubtitle = (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            <MultipleAvatars
                icons={ReportUtils.getIconsForParticipants(participants, personalDetails, {avatarSize: CONST.AVATAR_SIZE.SMALL, avatarStyle: [styles.emptyAvatar, styles.smallAvatar]})}
                size={CONST.AVATAR_SIZE.SMALL}
                shouldStackHorizontally
                shouldShowTooltip
                tooltipLines={ReportUtils.getMemberTooltip(participantPersonalDetails)}
            />
            <Text style={[styles.textNormal, styles.colorMuted]}>{translateLocal('workspace.invite.workspaceMembers', {count: participants.length})}</Text>
        </View>
    );

    const toggleOption = useCallback(
        (option: ReportUtils.OptionData) => {
            if (option.isDisabled) {
                return;
            }

            setSelectedOptions((prevSelected) => {
                const isOptionSelected = _.some(prevSelected, (selected) => selected.accountID === option.accountID);
                let updatedSelectedOptions;
                if (isOptionSelected) {
                    updatedSelectedOptions = _.reject(prevSelected, (selected) => selected.accountID === option.accountID);
                } else {
                    updatedSelectedOptions = [...prevSelected, option];
                }
                return updatedSelectedOptions;
            });
        },
        [setSelectedOptions],
    );

    const selectUser = useCallback(
        (option: ReportUtils.OptionData) => {
            if (option.isDisabled) {
                return;
            }

            // If user is already selected, remove them
            const isOptionSelected = _.some(selectedOptions, (selected) => selected.accountID === option.accountID);
            if (isOptionSelected) {
                setSelectedOptions(_.reject(selectedOptions, (selected) => selected.accountID === option.accountID));
                return;
            }

            // Add the selected user
            setSelectedOptions([...selectedOptions, option]);
            setSearchTerm('');
        },
        [selectedOptions],
    );

    const headerChildren = useMemo(
        () => (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pl5, styles.pr5, styles.pb3]}>
                <SearchInput
                    value={searchTerm}
                    placeholder={translate('optionsSelector.nameEmailOrPhoneNumber')}
                    onChangeText={(text) => {
                        setSearchTerm(text);
                        setIsSearchingForUser(!isEmptyObject(text));
                    }}
                    onClear={() => {
                        setSearchTerm('');
                        setIsSearchingForUser(false);
                    }}
                    isFocused={isSearchFocused}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    shouldDelayFocus
                />
            </View>
        ),
        [searchTerm, translate, isSearchFocused, styles],
    );

    const footerContent = useMemo(
        () => (
            <FixedFooter style={[styles.flexGrow0]}>
                <OfflineWithFeedback
                    errors={errors}
                    errorRowStyles={[styles.mb2]}
                    onClose={() => setErrors({})}
                    pendingAction={isInviteProcessing ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : null}
                >
                    <Text style={[styles.mb2, styles.colorDanger, styles.alignSelfStart]}>{ErrorUtils.getLatestErrorMessage(errors)}</Text>
                    <Text style={[styles.textLabelSupporting, styles.mb1, styles.mhn5]}>
                        {translate('common.recipients')}
                        {numberOfRecipients > 0 ? ` (${numberOfRecipients})` : ''}
                    </Text>
                    <OptionSelector
                        listContainerStyles={[styles.flexGrow1]}
                        sections={options.sections}
                        selectedOptions={selectedOptions}
                        value={searchTerm}
                        onSelectRow={selectUser}
                        onConfirm={inviteUser}
                        onChangeText={setSearchTerm}
                        headerMessage=""
                        hideSectionHeaders
                        forceTextUnreadStyle
                        shouldDelayFocus
                        isDisabled={isInviteProcessing || isExecuting}
                        textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                        isMultipleParticipantAllowed={false}
                        showTitleTooltip={false}
                        boldStyle
                        shouldSingleExecute
                        focusedSize="lg"
                    />
                </OfflineWithFeedback>
            </FixedFooter>
        ),
        [
            errors,
            styles,
            isInviteProcessing,
            numberOfRecipients,
            translate,
            options.sections,
            selectedOptions,
            selectUser,
            inviteUser,
            searchTerm,
            isExecuting,
            setErrors,
        ],
    );

    return (
        <ScreenWrapper testID={InvitePage.displayName}>
            <HeaderWithBackButton title={headerTitle} subtitle={headerSubtitle} onBackButtonPress={Navigation.goBack} />
            {headerChildren}
            <ScrollView style={[styles.flexGrow1]}>
                <OptionSelector
                    listContainerStyles={[styles.flexGrow1]}
                    sections={options.sections}
                    selectedOptions={selectedOptions}
                    value={searchTerm}
                    onSelectRow={toggleOption}
                    onConfirm={inviteUser}
                    onChangeText={setSearchTerm}
                    headerMessage=""
                    hideSectionHeaders
                    forceTextUnreadStyle
                    shouldDelayFocus
                    isDisabled={isInviteProcessing || isExecuting}
                    textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                    isMultipleParticipantAllowed={false}
                    showTitleTooltip={false}
                    boldStyle
                    shouldSingleExecute
                    focusedSize="lg"
                />
            </ScrollView>
            {footerContent}
        </ScreenWrapper>
    );
}

InvitePage.displayName = 'InvitePage';

export default compose(
    withNavigationFocus,
    withLocalize,
    withOnyx<InvitePageProps, InvitePageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        policyMembers: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${route.params?.policyID}`,
        },
        policyID: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params?.policyID}`,
        },
        policy: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params?.policyID}`,
        },
    }),
)(InvitePage);