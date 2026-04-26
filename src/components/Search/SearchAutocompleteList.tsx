import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {PersonalDetailsList, RecentReports, SearchContext} from '@src/types/onyx';
import {useContext, useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionsList from './OptionsList';
import type {OptionData} from './OptionsListUtils';
import {getSearchOptions} from '@libs/OptionsListUtils';
import useSearchParameters from '@hooks/useSearchParameters';
import useCurrentReportID from '@hooks/useCurrentReportID';
import usePrevious from '@hooks/usePrevious';
import useOnyx from '@hooks/useOnyx';
import SearchContext from '@pages/Search/context/SearchContext';

type SearchAutocompleteListProps = {
    /** Callback to inform parent modal of close */
    onModalClose: () => void;

    /** Callback to submit the hero route */
    onSubmit: (option: OptionData | null) => void;
};

function SearchAutocompleteList({onModalClose, onSubmit}: SearchAutocompleteListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [allPersonalDetails] = useOnyx<OnyxEntry<PersonalDetailsList>>(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [recentReports] = useOnyx<OnyxEntry<RecentReports>>(ONYXKEYS.NVP_RECENT_REPORTS);
    const searchContext = useContext<SearchContext | null>(SearchContext);
    const searchQuery = useSearchParameters().query ?? '';
    const currentReportId = useCurrentReportID();
    const previousSearchQuery = usePrevious(searchQuery);

    const {canInviteUser} = searchContext ?? {canInviteUser: false};

    const searchOptions = useMemo(() => {
        if (!searchContext) {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
                reportActions: [],
            };
        }

        const query = searchQuery.trim();
        const isValidEmail = query && CONST.EMAIL_REGEX.test(query);
        const shouldIncludeUserToInvite = canInviteUser && isValidEmail && !isOffline;

        return getSearchOptions({
            query,
            allPersonalDetails: allPersonalDetails ?? {},
            recentReports: recentReports ?? {},
            exclude: [currentReportId],
            maxRecentReportsToShow: CONST.RECENT_REPORTS.MAX_AMOUNT,
            includeRecentReports: true,
            includePersonalDetails: true,
            includeOwnedReportsOnly: false,
            includeOwnedWorkspaceChats: false,
            includeThreads: false,
            includeTasks: false,
            includeDistanceRequests: false,
            includeMoneyRequests: false,
            includeScannedInvoices: false,
            includeCategories: false,
            includeTags: false,
            includeSettledRequests: false,
            sortByLastMessageTimestamp: false,
            includeDeactivatedReports: false,
            includeCreatedTaskReports: false,
            includeP2P: true,
            includeMoneyRequestsFromExpensifyCards: false,
            includeThreadParents: false,
            includeChatRooms: true,
            includePolicyExpenseChat: true,
            includeTaskAssigneeChat: false,
            includeAnnounce: false,
            includeSelfDM: false,
            includeArchivedReports: false,
            includeAdminChats: false,
            includeUserToInvite: shouldIncludeUserToInvite,
            excludeEmptyChats: false,
        });
    }, [
        allPersonalDetails,
        canInviteUser,
        currentReportId,
        isOffline,
        recentReports,
        searchContext,
        searchQuery,
        previousSearchQuery,
    ]);

    const {personalDetails, recentReports: recentReportsOptions, userToInvite, reportActions} = searchOptions;

    const sections = useMemo(() => {
        const result = [];

        if (recentReportsOptions.length > 0) {
            result.push({
                title: translate('common.recent'),
                data: recentReportsOptions,
                shouldShow: true,
                indexOffset: 0,
            });
        }

        if (personalDetails.length > 0) {
            result.push({
                title: translate('common.contacts'),
                data: personalDetails,
                shouldShow: true,
                indexOffset: recentReportsOptions.length,
            });
        }

        if (reportActions.length > 0) {
            result.push({
                title: translate('common.messages'),
                data: reportActions,
                shouldShow: true,
                indexOffset: recentReportsOptions.length + personalDetails.length,
            });
        }

        if (userToInvite) {
            result.push({
                title: '',
                data: [userToInvite],
                shouldShow: true,
                indexOffset: recentReportsOptions.length + personalDetails.length + reportActions.length,
                isUserToInvite: true,
            });
        }

        return result;
    }, [recentReportsOptions, personalDetails, reportActions, translate, userToInvite]);

    const initiallyFocusedOptionKey = useMemo(() => {
        if (userToInvite) {
            return userToInvite.reportID;
        }
        if (recentReportsOptions.length > 0) {
            return recentReportsOptions[0].reportID;
        }
        if (personalDetails.length > 0) {
            return personalDetails[0].reportID;
        }
        return undefined;
    }, [recentReportsOptions, personalDetails, userToInvite]);

    return (
        <OptionsList
            sections={sections}
            focusedSize={styles.searchFocusedSize}
            onSelectRow={onSubmit}
            onDismissModal={onModalClose}
            showTitleTooltip={false}
            hideAdditionalOptionStates
            disableFocusOptions
            disableRowInnerPadding
            shouldHaveOptionSeparator
            shouldPreventDefaultFocusOnSelectRow
            shouldUseStyleForChildren
            shouldUseFocusedStatusForDisabled
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            hideSectionHeaders={!!userToInvite}
            userToInvite={userToInvite}
        />
    );
}

SearchAutocompleteList.displayName = 'SearchAutocompleteList';

export default SearchAutocompleteList;