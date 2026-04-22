/**
 * ESLint plugin that conditionally suppresses lint rules which are unnecessary
 * for files that React Compiler successfully compiles.
 *
 * React Compiler automatically memoizes components and hooks, making rules like
 * `react/jsx-no-constructed-context-values` redundant for compiled files.
 *
 * This plugin uses an ESLint processor to:
 * 1. Run React Compiler on each file during the `preprocess` phase
 * 2. If all functions/components compile successfully, filter out messages
 *    from rules that React Compiler makes unnecessary in `postprocess`
 * 3. If any function fails to compile, preserve all lint messages as-is
 */
import {transformSync} from '@babel/core';
import seatbelt from 'eslint-seatbelt';
import _ from 'lodash';
import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const ReactCompilerConfig = require('../config/babel/reactCompilerConfig');

// Seatbelt ships its own processor that preprocess/postprocess every lint run to
// ratchet allowed errors recorded in `eslint.seatbelt.tsv`. ESLint only supports
// a single processor per file, so we have to chain it manually here — otherwise
// this processor would replace seatbelt's for every `.tsx` / `.jsx` file.
const seatbeltProcessor = seatbelt.processors.seatbelt;

// Rules that are entirely unnecessary when React Compiler successfully compiles
// all functions in a file. Add more rules here as needed.
const RULES_SUPPRESSED_BY_REACT_COMPILER = new Set(['react/jsx-no-constructed-context-values', 'rulesdir/no-inline-useOnyx-selector']);

// react-hooks/exhaustive-deps warnings that suggest useCallback/useMemo are
// false positives in compiled files, since React Compiler auto-memoizes.
// We only suppress the "wrap in useCallback/useMemo" suggestions, NOT warnings
// about genuinely missing dependencies.
const EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN = /\buseCallback\(\) Hook\b|\buseMemo\(\) Hook\b/;

// Per-file compilation results, populated in preprocess, consumed in postprocess.
const compilationResults = new Map();

/**
 * Check whether React Compiler can successfully compile all functions in a file.
 *
 * Uses @babel/core's transformSync with the React Compiler plugin and a custom
 * logger to detect CompileError/CompileSuccess events without emitting code.
 *
 * @param {string} text - The source code of the file
 * @param {string} filename - The file path (used by Babel for parser heuristics)
 * @returns {boolean} true if at least one function compiled and none errored
 */
function checkReactCompilerCompilation(text, filename) {
    let hasError = false;
    let hasSuccess = false;

    try {
        transformSync(text, {
            filename,
            ast: false,
            code: false,
            configFile: false,
            babelrc: false,
            parserOpts: {
                plugins: ['typescript', 'jsx'],
            },
            plugins: [
                [
                    'babel-plugin-react-compiler',
                    {
                        ...ReactCompilerConfig,
                        panicThreshold: 'none',
                        noEmit: true,
                        logger: {
                            logEvent(_filename, event) {
                                if (event.kind === 'CompileError') {
                                    hasError = true;
                                }
                                if (event.kind === 'CompileSuccess') {
                                    hasSuccess = true;
                                }
                            },
                        },
                    },
                ],
            ],
        });
    } catch {
        hasError = true;
    }

    return hasSuccess && !hasError;
}

function filterCompilerSuppressedMessages(messages, filename) {
    const allCompiled = compilationResults.get(filename);
    compilationResults.delete(filename);

    if (!allCompiled) {
        return messages;
    }

    return _.filter(messages, (msg) => {
        if (RULES_SUPPRESSED_BY_REACT_COMPILER.has(msg.ruleId)) {
            return false;
        }
        if (msg.ruleId === 'react-hooks/exhaustive-deps' && EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN.test(msg.message)) {
            return false;
        }
        return true;
    });
}

const plugin = {
    meta: {name: 'eslint-plugin-react-compiler-compat'},
    processors: {
        'react-compiler-compat': {
            meta: {
                name: 'react-compiler-compat',
                version: '1.0.0',
            },
            supportsAutofix: true,

            preprocess(text, filename) {
                // Skip files that React Compiler wouldn't compile anyway
                if (filename.includes('/tests/') || filename.includes('node_modules/')) {
                    compilationResults.set(filename, false);
                } else {
                    compilationResults.set(filename, checkReactCompilerCompilation(text, filename));
                }

                // Register this file with seatbelt (this is what seatbelt's
                // own preprocess does) so that its postprocess can transform
                // errors into warnings based on `eslint.seatbelt.tsv`.
                return seatbeltProcessor.preprocess(text, filename);
            },

            postprocess(messages, filename) {
                // Order matters: filter messages that React Compiler already
                // makes irrelevant first, then hand the remaining messages to
                // seatbelt so its ratchet doesn't count suppressed rules.
                const filtered = filterCompilerSuppressedMessages(messages[0], filename);
                return seatbeltProcessor.postprocess([filtered], filename);
            },
        },
    },
};

export default plugin;
