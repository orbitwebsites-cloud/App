import ROUTES from '@src/ROUTES';

/**
 * Regression tests for https://github.com/Expensify/App/issues/88434
 *
 * The SPLIT_EXPENSE / SPLIT_EXPENSE_SEARCH routes used to declare an optional
 * `:backTo?` path parameter at the end of the path. That segment collided with
 * the names of the nested split tab screens (`amount`, `percentage`, `date`),
 * which caused URLs like `.../overview/1/2/3/date` to be treated as
 * `backTo=date` rather than the date tab nested under the parent screen.
 *
 * When `Navigation.goBack(backTo)` later resolved that URL, the resulting
 * state was missing the required params and SplitExpensePage rendered the
 * `FullPageNotFoundView` ("Not here") page after saving split dates.
 *
 * The old route shape also carried an inline TODO acknowledging the problem:
 *   "TODO: Remove backTo from route once we have find another way to fix
 *    navigation issues with tabs".
 *
 * `backTo` is already propagated via the `?backTo=` query string produced by
 * `getUrlWithBackToParam`, so removing it from the path pattern keeps the
 * runtime behavior and eliminates the ambiguity with the tab segments.
 *
 * These tests lock in the fixed route shape.
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
});
