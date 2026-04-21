import CONST from '@src/CONST';

const SPLIT_TAB_SEGMENTS = Object.values(CONST.TAB.SPLIT);
const SPLIT_TAB_SUFFIX_REGEX = new RegExp(`/(?:${SPLIT_TAB_SEGMENTS.join('|')})(?=\\?|#|$)`);

/**
 * Removes a trailing split-expense tab segment (`amount` | `percentage` | `date`) from
 * a URL produced by `Navigation.getActiveRoute()`. Keeping tab names out of the
 * `backTo` we hand to child split-expense screens avoids the ambiguity with the
 * nested tab routes registered under `SPLIT_EXPENSE` / `SPLIT_EXPENSE_SEARCH` in
 * the linking config, which was the root cause of the "Not here" regression in
 * https://github.com/Expensify/App/issues/88434.
 *
 * The tab itself is still remembered across the back navigation because
 * `OnyxTabNavigator` persists the selected tab in Onyx.
 */
function stripSplitTabSuffix(url: string): string {
    return url.replace(SPLIT_TAB_SUFFIX_REGEX, '');
}

export default stripSplitTabSuffix;
