/**
 * @file Markdown parsing utilities.
 */

import type { Root } from 'mdast';
import remarkInlineLinks from 'remark-inline-links';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

/**
 * A simple helper function that parses the markdown document into an AST.
 *
 * @param md Markdown document as string.
 *
 * @returns Root node of the parsed markdown document (AST).
 */
export const parseMd = (md: string): Root => {
    return unified() // create a new processor
        .use(remarkParse) // parse the markdown document
        .use(remarkInlineLinks) // convert [text][link-definition] cases to [text](link) where possible
        .parse(md); // parse the fallback text to a node
};
