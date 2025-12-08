/**
 * @file Tests for changelog extraction logic.
 */

import type { Root } from 'mdast';
import { describe, expect, it } from 'vitest';

import { extractRelease } from '../../src/lib/extractor.js';
import { parseMd } from '../../src/lib/parser.js';

describe('extractRelease', () => {
    describe('basic version extraction', () => {
        it('should extract content for a version with plain text heading', () => {
            const md = `# Changelog

## 1.0.0

### Added
- New feature A
- New feature B

### Fixed
- Bug fix 1

## 0.9.0

### Changed
- Updated something`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);

            // Should contain the content between 1.0.0 and 0.9.0
            const hasAddedSection = result.children.some(
                (node) => node.type === 'heading' && 'children' in node
                && node.children.some((child) => 'value' in child && child.value === 'Added'),
            );
            expect(hasAddedSection).toBe(true);
        });

        it('should extract content for a version with linked heading', () => {
            const md = `# Changelog

## [1.0.0](https://github.com/example/releases/v1.0.0)

### Added
- New feature A

## [0.9.0](https://github.com/example/releases/v0.9.0)

### Changed
- Updated something`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);
        });

        it('should extract content for a version with date suffix', () => {
            const md = `# Changelog

## 1.0.0 - 2024-01-01

### Added
- New feature A

## 0.9.0 - 2023-12-01

### Changed
- Updated something`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);
        });

        it('should extract content for a version in brackets', () => {
            const md = `# Changelog

## [2.0.4]

### Added
- New feature A
- New feature B

## [2.0.3]

### Fixed
- Bug fix`;

            const tree = parseMd(md);
            const transformer = extractRelease('2.0.4');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);

            const hasAddedSection = result.children.some(
                (node) => node.type === 'heading' && 'children' in node
                && node.children.some((child) => 'value' in child && child.value === 'Added'),
            );
            expect(hasAddedSection).toBe(true);
        });

        it('should extract content for a bracketed version with metadata', () => {
            const md = `# Changelog

## [2.0.4] (prerelease) - 2025-11-28

### Added
- Prerelease feature

### Fixed
- Bug fix

## [2.0.3] - 2025-11-20

### Changed
- Previous version`;

            const tree = parseMd(md);
            const transformer = extractRelease('2.0.4');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);

            const content = JSON.stringify(result);
            expect(content).toContain('Prerelease feature');
            expect(content).not.toContain('Previous version');
        });
    });

    describe('version matching', () => {
        it('should match exact version only', () => {
            const md = `# Changelog

## 1.0.0

### Added
- Feature

## 1.0.0-beta

### Added
- Beta feature

## 10.0.0

### Added
- Different version`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);

            // Should match 1.0.0 but not 1.0.0-beta or 10.0.0
            const content = JSON.stringify(result);
            expect(content).toContain('Feature');
            expect(content).not.toContain('Beta feature');
            expect(content).not.toContain('Different version');
        });

        it('should handle versions with special characters', () => {
            const md = `# Changelog

## 1.0.0-beta.1

### Added
- Beta feature`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0-beta.1');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);
        });

        it('should escape regex special characters in version', () => {
            const md = `# Changelog

## 1.0.0+build.123

### Added
- Build feature`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0+build.123');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);
        });
    });

    describe('fallback behavior', () => {
        it('should return fallback when version is not found', () => {
            const md = `# Changelog

## 1.0.0

### Added
- Feature`;

            const tree = parseMd(md);
            const transformer = extractRelease('2.0.0', { fallback: 'Version not found' });
            const result = transformer(tree);

            expect(result.type).toBe('root');
            const paragraph = result.children[0];
            expect(paragraph?.type).toBe('paragraph');
        });

        it('should return empty root when no fallback and version not found', () => {
            const md = `# Changelog

## 1.0.0

### Added
- Feature`;

            const tree = parseMd(md);
            const transformer = extractRelease('2.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children).toHaveLength(0);
        });

        it('should use custom fallback text', () => {
            const md = `# Changelog

## 1.0.0

### Added
- Feature`;

            const tree = parseMd(md);
            const transformer = extractRelease('2.0.0', {
                fallback: '## No Release Notes\n\nRelease notes are not available.',
            });
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);

            const hasHeading = result.children.some(
                (node) => node.type === 'heading',
            );
            expect(hasHeading).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle empty tree', () => {
            const tree: Root = {
                type: 'root',
                children: [],
            };

            const transformer = extractRelease('1.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children).toHaveLength(0);
        });

        it('should handle tree with no headings', () => {
            const md = `Just some text without any headings.

More text here.`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children).toHaveLength(0);
        });

        it('should handle version as last section', () => {
            const md = `# Changelog

## 1.0.0

### Added
- Feature A
- Feature B

### Fixed
- Bug 1`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);
        });

        it('should handle version with no content', () => {
            const md = `# Changelog

## 1.0.0

## 0.9.0

### Changed
- Update`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children).toHaveLength(0);
        });
    });

    describe('multiple version sections', () => {
        it('should extract only the specified version', () => {
            const md = `# Changelog

## 2.0.0

### Added
- Feature 2.0

## 1.0.0

### Added
- Feature 1.0

## 0.9.0

### Changed
- Update 0.9`;

            const tree = parseMd(md);
            const transformer = extractRelease('1.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);

            const content = JSON.stringify(result);
            expect(content).toContain('Feature 1.0');
            expect(content).not.toContain('Feature 2.0');
            expect(content).not.toContain('Update 0.9');
        });

        it('should extract content between correct version boundaries', () => {
            const md = `# Changelog

## 3.0.0
- Feature 3

## 2.0.0
- Feature 2

## 1.0.0
- Feature 1

## 0.9.0
- Feature 0.9`;

            const tree = parseMd(md);
            const transformer = extractRelease('2.0.0');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            const content = JSON.stringify(result);
            expect(content).toContain('Feature 2');
            expect(content).not.toContain('Feature 3');
            expect(content).not.toContain('Feature 1');
            expect(content).not.toContain('Feature 0.9');
        });
    });

    describe('unreleased and special version names', () => {
        it('should handle Unreleased section', () => {
            const md = `# Changelog

## Unreleased

### Added
- Upcoming feature

## 1.0.0

### Added
- Released feature`;

            const tree = parseMd(md);
            const transformer = extractRelease('Unreleased');
            const result = transformer(tree);

            expect(result.type).toBe('root');
            expect(result.children.length).toBeGreaterThan(0);

            const content = JSON.stringify(result);
            expect(content).toContain('Upcoming feature');
            expect(content).not.toContain('Released feature');
        });
    });
});
