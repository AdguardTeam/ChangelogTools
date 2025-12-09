# Changelog Tools

<!-- markdownlint-disable -->
<p align="center">
    <a href="https://www.npmjs.com/package/@adguard/changelog-tools"><img src="https://img.shields.io/npm/v/@adguard/changelog-tools" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/@adguard/changelog-tools"><img src="https://img.shields.io/npm/dm/@adguard/changelog-tools" alt="NPM Downloads" /></a>
    <a href="https://github.com/AdguardTeam/ChangelogTools/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@adguard/changelog-tools" alt="License" /></a>
</p>
<!-- markdownlint-restore -->

Tools for working with changelogs in [Keep a Changelog](https://keepachangelog.com/) format.

> **⚠️ Development Status:** This library is currently under active development and provides
> limited functionality. We plan to extend it with additional features as needed.
>
> **API Stability:** The API may change at any time with new releases until we reach version 1.0.
> A stable 1.0 release is planned for the far future.

## Features

- 📝 Extract specific version content from CHANGELOG.md files
- 🔍 Supports both plain (`## 1.0.0`) and bracketed (`## [1.0.0]`) version formats
- 🔗 Handles markdown links and reference-style links
- 🛠️ Available as both CLI tool and programmatic API

## Installation

```bash
npm install @adguard/changelog-tools
# or
pnpm add @adguard/changelog-tools
# or
yarn add @adguard/changelog-tools
```

## CLI Usage

### Extract a version from changelog

```bash
# Extract version from CHANGELOG.md in current directory
changelog-tools --extract-version 1.0.0

# or using short flag
changelog-tools -e 1.0.0

# Specify custom changelog file
changelog-tools -e 1.0.0 --input path/to/CHANGELOG.md

# With custom fallback text if version not found
changelog-tools -e 1.0.0 --fallback "No release notes available"
```

### Show version

```bash
changelog-tools --version
```

## Programmatic Usage

```typescript
import { extractRelease } from '@adguard/changelog-tools/lib';
import { readFile } from 'node:fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkInlineLinks from 'remark-inline-links';

// Read and process changelog
const output = await unified()
    .use(remarkParse)
    .use(remarkInlineLinks)
    .use(extractRelease, '1.0.0', { 
        fallback: 'No release notes found' 
    })
    .use(remarkStringify, { bullet: '-' })
    .process(await readFile('CHANGELOG.md'));

console.log(output.toString());
```

## Supported Changelog Formats

The extractor supports various heading formats:

```markdown
## 1.0.0
## 1.0.0 - 2024-01-01
## 1.0.0 (2024-01-01)
## [1.0.0]
## [1.0.0] (prerelease) - 2024-01-01
## [1.0.0](https://github.com/example/releases/v1.0.0)
```

## API

### `extractRelease(version, options?)`

Extracts content for a specific version from a changelog AST.

**Parameters:**

- `version` (string): Version number to extract (e.g., '1.0.0')
- `options` (object, optional):
    - `fallback` (string): Text to return if version is not found

**Returns:** Transformer function for use with unified/remark

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm coverage

# Build
pnpm build

# Lint
pnpm lint
```

## License

MIT

## Links

- [GitHub Repository](https://github.com/AdguardTeam/ChangelogTools)
- [Issues](https://github.com/AdguardTeam/ChangelogTools/issues)
- [Changelog](./CHANGELOG.md)
