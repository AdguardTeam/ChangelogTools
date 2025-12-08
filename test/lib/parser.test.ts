/**
 * @file Tests for markdown parsing utilities.
 */

import type { Heading, Paragraph } from 'mdast';
import { describe, expect, it } from 'vitest';

import { parseMd } from '../../src/lib/parser.js';

describe('parseMd', () => {
    it('should parse simple text into a root node with a paragraph', () => {
        const md = 'Hello, world!';
        const result = parseMd(md);

        expect(result).toBeDefined();
        expect(result.type).toBe('root');
        expect(result.children).toHaveLength(1);

        const paragraph = result.children[0] as Paragraph;
        expect(paragraph.type).toBe('paragraph');
        expect(paragraph.children).toHaveLength(1);
        expect(paragraph.children[0]).toMatchObject({
            type: 'text',
            value: 'Hello, world!',
        });
    });

    it('should parse empty string into a root node with no children', () => {
        const md = '';
        const result = parseMd(md);

        expect(result).toBeDefined();
        expect(result.type).toBe('root');
        expect(result.children).toHaveLength(0);
    });

    it('should parse heading into a heading node', () => {
        const md = '## Version 1.0.0';
        const result = parseMd(md);

        expect(result.type).toBe('root');
        expect(result.children).toHaveLength(1);

        const heading = result.children[0] as Heading;
        expect(heading.type).toBe('heading');
        expect(heading.depth).toBe(2);
        expect(heading.children).toHaveLength(1);
        expect(heading.children[0]).toMatchObject({
            type: 'text',
            value: 'Version 1.0.0',
        });
    });

    it('should parse multiple headings and paragraphs', () => {
        const md = `# Main Title

Some content here.

## Section 1

More content.

## Section 2

Even more content.`;
        const result = parseMd(md);

        expect(result.type).toBe('root');
        expect(result.children.length).toBeGreaterThan(0);

        // First should be h1
        const firstHeading = result.children[0] as Heading;
        expect(firstHeading.type).toBe('heading');
        expect(firstHeading.depth).toBe(1);
    });

    it('should parse markdown lists', () => {
        const md = `- Item 1
- Item 2
- Item 3`;
        const result = parseMd(md);

        expect(result.type).toBe('root');
        expect(result.children).toHaveLength(1);
        expect(result.children[0]?.type).toBe('list');
    });

    it('should parse inline links', () => {
        const md = '[Link text](https://example.com)';
        const result = parseMd(md);

        expect(result.type).toBe('root');
        expect(result.children).toHaveLength(1);
        const paragraph = result.children[0] as Paragraph;
        expect(paragraph.children).toHaveLength(1);
        expect(paragraph.children[0]).toMatchObject({
            type: 'link',
            url: 'https://example.com',
        });
    });

    it('should parse reference-style links', () => {
        const md = `[Link text][ref]

[ref]: https://example.com`;
        const result = parseMd(md);

        expect(result.type).toBe('root');
        expect(result.children.length).toBeGreaterThan(0);
        // Reference-style links are parsed as linkReference nodes
        const paragraph = result.children[0] as Paragraph;
        expect(paragraph.children).toHaveLength(1);
        expect(paragraph.children[0]).toMatchObject({
            type: 'linkReference',
        });
    });

    it('should parse complex changelog-style markdown', () => {
        const md = `# Changelog

## [1.0.0] - 2024-01-01

### Added
- New feature 1
- New feature 2

### Fixed
- Bug fix 1

## [0.9.0] - 2023-12-01

### Changed
- Updated something

[1.0.0]: https://github.com/example/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/example/compare/v0.8.0...v0.9.0`;

        const result = parseMd(md);

        expect(result.type).toBe('root');
        expect(result.children.length).toBeGreaterThan(0);

        // Should have main heading
        const mainHeading = result.children[0] as Heading;
        expect(mainHeading.type).toBe('heading');
        expect(mainHeading.depth).toBe(1);
    });
});
