/**
 * @file Changelog extraction logic.
 *
 * @see {@link https://keepachangelog.com/en/1.1.0/ | Keep a Changelog}
 */

import escapeStringRegexp from 'escape-string-regexp';
import type { Root } from 'mdast';

import { parseMd } from './parser.js';
import { EMPTY, type ExtractOptions } from './types.js';

/**
 * Extracts the release from the markdown document.
 *
 * @param version Version number what we are looking for, e.g. 1.0.0.
 * @param options Extract options.
 *
 * @returns Transformer function.
 */
export const extractRelease = (version: string, options: ExtractOptions = {}) => {
    return (tree: Root) => {
        // Transformer function should return a Root node that passes to the next transformer in the chain (if any)
        const root: Root = {
            type: 'root',
            children: [],
        };

        // Prepare nodes
        const fallback = parseMd(options.fallback || EMPTY); // always present, at least as an empty string

        // String should start with the version number (optionally wrapped in brackets),
        // and should be followed by a space or the end of the string.
        // For example:
        //  - ## 1.0.0
        //  - ## 1.0.0 (2020-01-01)
        //  - ## 1.0.0 - 2020-01-01
        //  - ## [1.0.0] (prerelease) - 2025-11-28
        //  - ## [1.0.0](link)
        //  - etc.
        // Match either: "version " or "[version]" or "[version] "
        const escapedVersion = escapeStringRegexp(version);
        const VERSION_RE = new RegExp(`^(?:${escapedVersion}|\\[${escapedVersion}\\])(\\s|$)`);

        // It is enough to traverse the first level of the tree
        for (let i = 0; i < tree.children.length; i += 1) {
            const node = tree.children[i];

            // Find the first 2. level heading which includes the version number what we are looking for
            // like: ## 1.0.0
            if (node?.type === 'heading' && node.depth === 2) {
                if (
                    // ## 1.0.0
                    (node.children[0]?.type === 'text' && node.children[0]?.value?.match(VERSION_RE))
                    // ## [1.0.0](link)
                    || (
                        node.children[0]?.type === 'link'
                        && node.children[0]?.children[0]?.type === 'text'
                        && node.children[0]?.children[0]?.value?.match(VERSION_RE)
                    )
                ) {
                    // Find the next 2. level heading or the end of the document, and add all nodes between them to the
                    // root node
                    for (let j = i + 1; j < tree.children.length; j += 1) {
                        const nextNode = tree.children[j];

                        if (!nextNode) {
                            break;
                        }

                        if (nextNode.type === 'heading' && nextNode.depth === 2) {
                            break;
                        }

                        root.children.push(nextNode);
                    }
                }
            }
        }

        // If the root node has no children, return the fallback node
        return root.children.length > 0 ? root : fallback;
    };
};
