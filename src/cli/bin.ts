#!/usr/bin/env node
/**
 * @file CLI entry point for changelog tools.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { Command } from 'commander';
import remarkInlineLinks from 'remark-inline-links';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import { version as packageVersion } from '../../package.json';
import { extractRelease } from '../lib/extractor.js';
import { serializationOptions } from '../lib/types.js';

/**
 * Find CHANGELOG.md file in the current working directory (case insensitive).
 *
 * @returns Path to the changelog file.
 */
async function findChangelog(): Promise<string> {
    const cwd = process.cwd();
    const files = await readdir(cwd);

    // Look for CHANGELOG.md (case insensitive)
    const changelogFile = files.find((file) => file.toLowerCase() === 'changelog.md');

    if (!changelogFile) {
        throw new Error('CHANGELOG.md not found in current directory');
    }

    return path.join(cwd, changelogFile);
}

const program = new Command();

program
    .name('changelog-tools')
    .description('CLI tools for working with changelogs')
    .version(packageVersion);

program
    .command('extract')
    .option(
        '-e, --extract-version <version>',
        'Extract a specific version from the changelog (e.g., 1.0.0)',
    )
    .option(
        '-i, --input <file>',
        'Path to changelog file (default: searches for CHANGELOG.md in current directory)',
    )
    .option(
        '-f, --fallback <string>',
        'Fallback text if the version number is not found',
        'See [CHANGELOG.md](./CHANGELOG.md) for the list of changes.',
    )
    .action(async (options: { extractVersion?: string; input?: string; fallback: string }) => {
        try {
            if (!options.extractVersion) {
                program.help();
                return;
            }

            // Use provided input file or search for CHANGELOG.md
            const inputFilePath = options.input ? path.resolve(options.input) : await findChangelog();

            const output = await unified() // create a new processor
                .use(remarkParse) // parse the markdown document
                .use(remarkInlineLinks) // convert [text][link-definition] cases to [text](link) where possible
                .use(extractRelease, options.extractVersion, options) // extract & transform the release text, if any
                .use(remarkStringify, serializationOptions) // serialize the node to markdown
                .process(await readFile(inputFilePath)); // process the input file

            // Output to console
            // eslint-disable-next-line no-console
            console.log(output.toString());
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    });

program.parse();
