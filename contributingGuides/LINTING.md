# Linting

This repository uses [ESLint](https://eslint.org/) with the [eslint-seatbelt](https://github.com/justjake/eslint-seatbelt) processor to *gradually* tighten lint enforcement without forcing a single giant cleanup PR.

If you just want the cheat sheet, jump to [Day-to-day workflow](#day-to-day-workflow).

## TL;DR

- Every rule in [`eslint.config.mjs`](../eslint.config.mjs) is configured as `'error'`. Warnings (`'warn'`) are never used because seatbelt treats them as a no-op.
- Existing violations are recorded in [`eslint.seatbelt.tsv`](../eslint.seatbelt.tsv). Those are "temporarily allowed" errors and show up as warnings in your editor and CI — seatbelt downgrades them so CI stays green.
- Fixing a pre-existing error automatically tightens the ratchet in `eslint.seatbelt.tsv`. You cannot *introduce* new errors, only remove them.
- There is no longer a separate `lint-changed` config. A single `npm run lint` handles everything.

## Mental model: the ratchet

Think of `eslint.seatbelt.tsv` as a budget of technical debt. Each row of the TSV says:

```
<file>    <rule>    <allowed error count>
```

CI runs ESLint in "frozen" mode (`CI=1 npm run lint`). It fails if:

- A new error appears in a file that isn't covered by the ratchet, OR
- An existing `(file, rule)` pair exceeds its allowed count.

When you edit a file locally, seatbelt re-counts the violations. If your change *reduces* the count, seatbelt rewrites the TSV row so the new, lower number becomes the new ceiling. You never have to touch the TSV by hand in the common case — just run `npm run lint` and commit whatever it changes.

If you need to allow a *new* kind of error you can't immediately fix (e.g. during a framework migration), use `SEATBELT_INCREASE=<rule-name> npm run lint`. Do this sparingly and only when unavoidable. To expand the ratchet for every rule at once (e.g. after a big upstream config bump), run `SEATBELT_INCREASE=ALL npm run lint`.

## Day-to-day workflow

Most of the time you won't think about any of this. The TL;DR is:

1. Write code.
2. Run `npm run lint`. If seatbelt needs to update the TSV (because you removed a violation), it will.
3. Commit the TSV change alongside your code change.
4. CI re-runs lint in frozen mode (`CI=1`) and passes as long as you didn't introduce anything new.

### Adding a new lint rule

1. Add the rule to [`eslint.config.mjs`](../eslint.config.mjs) as `'error'` (never `'warn'`).
2. Run `SEATBELT_INCREASE="<rule-name>" npm run lint`. Seatbelt seeds the ratchet with all existing violations so the rule can be merged without fixing them all up front.
3. Commit the config change *and* the `eslint.seatbelt.tsv` diff.

### Fixing existing lint debt

Pick a rule, fix some violations, run `npm run lint`. The TSV either drops rows to 0 (dropping the row entirely) or lowers the count. Open a PR with both changes.

### Merge conflicts in `eslint.seatbelt.tsv`

`.gitattributes` declares `eslint.seatbelt.tsv merge=union`, so git takes every row from both sides of a rebase. The result may contain duplicates or stale rows; just run `npm run lint` after resolving and seatbelt will rewrite the file in canonical form.

## Why every rule is `'error'`

[eslint-seatbelt only tracks errors.](https://github.com/justjake/eslint-seatbelt#why-errors-only) If a rule is configured as `'warn'`, seatbelt ignores it entirely — it won't seed the ratchet and it won't enforce anything in CI. That makes `'warn'` strictly worse than `'error'` in this setup, because there is no mechanism to prevent new warnings from piling up. The upstream `eslint-config-expensify` package (v3.0.0+) was updated to the same policy, so every rule we inherit is already an error.

## Why there is no more `lint-changed`

Before seatbelt, the repository ran two parallel lint configurations:

- `npm run lint` (the main config) enforced the inherited rules globally, with a `--max-warnings=313` cap.
- `npm run lint-changed` (the stricter config) enforced extra rules only on files changed in the current PR, via a separate `eslint.changed.config.mjs`.

This split existed because it wasn't feasible to enforce the stricter rules against every existing file. Seatbelt solves that problem directly: all of the `lint-changed` rules have been merged into `eslint.config.mjs`, existing violations are ratcheted in the TSV, and new violations are blocked in CI. The `eslint.changed.config.mjs`, `scripts/lintChanged.sh`, `lint-changed.yml` workflow, and `lint-changed` npm script have all been removed.

## Composite ESLint processor

`eslint-plugin-react-compiler-compat` also exposes a processor (which filters out lint messages that React Compiler makes redundant). ESLint only supports a single processor per file, so the `react-compiler-compat` processor internally chains seatbelt's processor: it filters compiler-suppressed rules first, then hands the remaining messages to seatbelt for ratcheting. If you add another processor to the pipeline in the future, remember to chain it through seatbelt too, otherwise seatbelt will stop ratcheting for any file type that processor covers.

## Reference

- Main config: [`eslint.config.mjs`](../eslint.config.mjs)
- Ratchet: [`eslint.seatbelt.tsv`](../eslint.seatbelt.tsv)
- Merge driver: [`.gitattributes`](../.gitattributes)
- Upstream: [`eslint-config-expensify`](https://github.com/Expensify/eslint-config-expensify) (v3.0.0+)
- Processor docs: [`eslint-seatbelt` README](https://github.com/justjake/eslint-seatbelt#readme)
