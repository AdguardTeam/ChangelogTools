/**
 * @file Shared types and constants.
 */

import { type Options as StringifyOptions } from 'remark-stringify';

/**
 * Options for the extractRelease transformer.
 */
export interface ExtractOptions {
    /**
     * Fallback text if the version number is not found in the changelog.
     */
    fallback?: string;
}

export const EMPTY = '';
export const HYPHEN = '-';

/**
 * Options for the remark-stringify plugin.
 */
export const serializationOptions: StringifyOptions = {
    bullet: HYPHEN,
};
