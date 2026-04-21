import stripSplitTabSuffix from '@libs/stripSplitTabSuffix';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

/**
 * Regression tests for https://github.com/Expensify/App/issues/88434
 *
 * Two layers of the bug:
 *
 * 1. The SPLIT_EXPENSE / SPLIT_EXPENSE_SEARCH routes used to declare an
 *    optional `:backTo?` path parameter at the end of the path. That segment
 *    collided with the names of the nested split tab screens (`amount`,
 *    `percentage`, `date`), so URLs like `.../overview/1/2/3/date` could be
 *    parsed with `backTo = "date"` rather than nesting the `date` tab under
 *    the parent screen.
 *
 * 2. `SplitExpensePage.handleDatePress` passed `Navigation.getActiveRoute()`
 *    straight through as `backTo`. On the Date tab the active URL ended in
 *    `/date`, so the `backTo` carried that tab suffix. When
 *    `Navigation.goBack(backTo)` later resolved that URL, the ambiguity
 *    above kicked in and `SplitExpensePage` rendered `FullPageNotFoundView`
 *    ("Not here") after saving split dates.
 *
 * The old route shape also carried an inline TODO acknowledging the problem:
 *   "TODO: Remove backTo from route once we have find another way to fix
 *    navigation issues with tabs".
 *
 * The fix is twofold:
 *   - Drop `:backTo?` from both path patterns. `backTo` is already carried as
 *     a `?backTo=` query string by `getUrlWithBackToParam`, so removing it
 *     from the path keeps the runtime behavior and removes the tab-segment
 *     ambiguity.
 *   - Strip any trailing split tab segment from the URL we hand to child
 *     split-expense screens as `backTo` (`stripSplitTabSuffix`). The selected
 *     tab is already persisted in Onyx by `OnyxTabNavigator`, so we do not
 *     need to encode it in the URL.
 *
 * These tests lock in both layers.
 */
describe('SPLIT_EXPENSE route shape (issue #88434)', () => {
    describe('ROUTES.SPLIT_EXPENSE.route', () => {
        it('does not end with an optional :backTo? path param', () => {
            expect(ROUTES.SPLIT_EXPENSE.route).not.toMatch(/:backTo\??$/);
        });

        it('keeps the expected parent parameters', () => {
            expect(ROUTES.SPLIT_EXPENSE.route).toBe('create/split-expense/overview/:reportID/:transactionID/:splitExpenseTransactionID');
        });
    });

    describe('ROUTES.SPLIT_EXPENSE_SEARCH.route', () => {
        it('does not end with an optional :backTo? path param', () => {
            expect(ROUTES.SPLIT_EXPENSE_SEARCH.route).not.toMatch(/:backTo\??$/);
        });

        it('keeps the expected parent parameters and /search literal', () => {
            expect(ROUTES.SPLIT_EXPENSE_SEARCH.route).toBe('create/split-expense/overview/:reportID/:transactionID/:splitExpenseTransactionID/search');
        });
    });

    describe('ROUTES.SPLIT_EXPENSE.getRoute', () => {
        it('returns backTo as a query-string parameter, never a path segment', () => {
            const url = ROUTES.SPLIT_EXPENSE.getRoute('1', '2', '3', '/r/7890/details');

            expect(url).toContain('?backTo=');
            expect(url.split('?').at(0)).toBe('create/split-expense/overview/1/2/3');
        });

        it('omits backTo entirely when none is provided', () => {
            const url = ROUTES.SPLIT_EXPENSE.getRoute('1', '2', '3');

            expect(url).toBe('create/split-expense/overview/1/2/3');
        });
    });

    describe('stripSplitTabSuffix', () => {
        /*
         * `SplitExpensePage.handleDatePress` uses this helper to sanitize the
         * URL it feeds into `ROUTES.SPLIT_EXPENSE_CREATE_DATE_RANGE.getRoute`
         * as `backTo`. We must never allow a tab-named segment to survive into
         * `backTo`, because that was the second half of the regression.
         */
        const SPLIT_TAB_VALUES = Object.values(CONST.TAB.SPLIT);

        it.each(SPLIT_TAB_VALUES)('strips a trailing /%s segment from the SPLIT_EXPENSE active route', (tab) => {
            const base = 'create/split-expense/overview/1/2/0';
            expect(stripSplitTabSuffix(`${base}/${tab}`)).toBe(base);
        });

        it.each(SPLIT_TAB_VALUES)('strips a trailing /%s segment from the SPLIT_EXPENSE_SEARCH active route', (tab) => {
            const base = 'create/split-expense/overview/1/2/0/search';
            expect(stripSplitTabSuffix(`${base}/${tab}`)).toBe(base);
        });

        it('preserves a query string that sits after the tab segment', () => {
            const url = 'create/split-expense/overview/1/2/0/date?foo=bar';
            expect(stripSplitTabSuffix(url)).toBe('create/split-expense/overview/1/2/0?foo=bar');
        });

        it('does not strip tab-like names that appear mid-path', () => {
            const url = 'workspaces/abc/date/settings';
            expect(stripSplitTabSuffix(url)).toBe('workspaces/abc/date/settings');
        });

        it('returns the input unchanged when no tab segment is present', () => {
            const url = 'create/split-expense/overview/1/2/0';
            expect(stripSplitTabSuffix(url)).toBe(url);
        });
    });
});
