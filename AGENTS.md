# AGENTS.md

## Table Of Contents

- [Project Overview](#project-overview)
- [Technical Context](#technical-context)
- [Project Structure](#project-structure)
- [Build And Test Commands](#build-and-test-commands)
- [Contribution Instructions](#contribution-instructions)
- [Code Guidelines](#code-guidelines)
    - [System Design](#system-design)
    - [Architecture](#architecture)
    - [Code Quality](#code-quality)
    - [Testing](#testing)
    - [Dependency Management](#dependency-management)
    - [Configuration & Documentation](#configuration--documentation)
    - [Releases & CI/CD](#releases--cicd)
    - [Markdown Formatting](#markdown-formatting)

## Project Overview

`@adguard/changelog-tools` is a set of tools for working with changelogs
in [Keep a Changelog](https://keepachangelog.com/) format. It provides
an `extractRelease` transformer for the unified/remark ecosystem and a
CLI (`changelog-tools`) for extracting specific version content from
`CHANGELOG.md` files.

The library supports both plain (`## 1.0.0`) and bracketed
(`## [1.0.0]`) version formats, handles markdown links, and is available
as both a CLI tool and a programmatic API.

The package is developed in the private repository
`AdGuardSoftwareLimited/ext-changelog-tools` and mirrored to the public
repository `AdguardTeam/ChangelogTools`.

## Technical Context

| Category | Detail |
| --- | --- |
| **Language / Version** | TypeScript ~5.8 (ES module, `"type": "module"`) |
| **Runtime** | Node.js >= 20 |
| **Package Manager** | pnpm 10.x |
| **Build** | Rollup 4 → ESM + type declarations |
| **Test** | vitest 4.x |
| **Linter** | ESLint 8 (airbnb-base + airbnb-typescript, import, jsdoc, n, boundaries) |
| **Markdown Linting** | markdownlint-cli2 |
| **Type Checking** | `tsc` |
| **Primary Dependencies** | `commander`, `remark-parse`, `remark-stringify`, `unified` |
| **Storage** | N/A |
| **Target Platform** | Node.js (library + CLI) |
| **Project Type** | Library / Package + CLI |
| **Performance Goals** | N/A |
| **Constraints** | API may change before 1.0 |
| **Scale / Scope** | Consumed by AdGuard release tooling |

## Project Structure

```text
.
├── src/
│   ├── lib/                     # Library API (extractRelease transformer)
│   └── cli/                     # CLI entry point
├── test/                        # vitest test files
├── scripts/
│   └── transform-dts.ts         # Post-build declaration transformer
├── package.json                 # Package manifest and scripts
├── rollup.config.ts             # Rollup build configuration
├── vitest.config.ts             # vitest test configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.base.json           # Shared TypeScript config
├── tsconfig.build.json          # TypeScript build (declaration emit) config
├── .eslintrc.cjs                # ESLint configuration
├── .husky/                      # Git hooks (husky)
├── .lintstagedrc.js             # lint-staged configuration
├── Dockerfile                   # Multi-stage CI build pipeline
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI build and test on PRs
│       ├── mirror.yml           # Mirror to public repo on push to master
│       ├── prepare-release.yml  # Release PR creation
│       └── publish-release.yml  # Auto-tag + release pipeline
├── README.md                    # User-facing documentation
├── CHANGELOG.md                 # Release history
├── DEVELOPMENT.md               # Local development setup guide
└── DEPLOYMENT.md                # Deployment and release process
```

## Build And Test Commands

| Command | Description |
| --- | --- |
| `pnpm build` | Build ESM + type declarations via Rollup |
| `pnpm test` | Run vitest test suite |
| `pnpm coverage` | Run vitest with coverage |
| `pnpm lint` | Run type checking + ESLint + markdownlint |
| `pnpm check-types` | Run TypeScript type checking (`tsc`) |
| `pnpm increment` | Bump patch version (no git tag) |

## Contribution Instructions

- You MUST verify your changes with the linter and tests:

  ```bash
  pnpm lint
  pnpm test
  pnpm build
  ```

- You MUST update the unit tests for changed code.

- When making changes to the project structure, ensure the Project
  Structure section in `AGENTS.md` is updated and remains valid.

- When modifying CI workflows, ensure `prepare-release.yml` and
  `publish-release.yml` stay in sync. The version is derived from git
  tags (not `package.json`).

- Never change `package.json` version manually — it is not stored in
  source and is injected during CI from the git tag.

- After completing the task you MUST verify that the code you have
  written follows the Code Guidelines in this file.

## Code Guidelines

### System Design

Design for a library:

- The library is consumed by other code — keep side effects out of the
  default code path.
- Export a stable public API. The `extractRelease` transformer is the
  primary programmatic surface; the CLI wraps it.
- Keep the dependency footprint reasonable — runtime dependencies are
  limited to the unified/remark ecosystem and `commander`/`escape-string-regexp`.

### Architecture

- **Library layer** (`src/lib/`) — the `extractRelease` transformer
  operates on a remark AST (mdast) to extract version content.
- **CLI layer** (`src/cli/`) — wraps the library using `commander`,
  reading a changelog file and printing the extracted version content.
- **Boundaries** — the ESLint `boundaries` plugin enforces that the CLI
  may import from `lib` and `utils`, and `lib` may import from `utils`,
  but not the reverse.

### Code Quality

- Follow the airbnb-base and airbnb-typescript ESLint configs.
- Use JSDoc comments for public functions (jsdoc plugin enforces
  descriptions and parameter docs).
- Use 4-space indentation (enforced by `@typescript-eslint/indent`).
- Use explicit member accessibility (enforced by
  `@typescript-eslint/explicit-member-accessibility`).
- Use consistent type imports (`@typescript-eslint/consistent-type-imports`
  with inline-type-imports).
- Handle errors by throwing descriptive `Error` objects.

### Testing

- Tests live in `test/` and use vitest.
- Test both valid and invalid version formats (plain, bracketed, with
  dates, with links).
- Test the fallback behavior when a version is not found.

### Dependency Management

- **Runtime dependencies** are limited to `commander`,
  `escape-string-regexp`, and the unified/remark ecosystem.
- **Reputable sources only** — dependencies must come from
  well-established, actively maintained projects.
- **Minimize dependency count** — justify every addition.

### Configuration & Documentation

- Build configuration lives in `rollup.config.ts`, `tsconfig.json`,
  `tsconfig.base.json`, and `tsconfig.build.json`.
- When changing build commands or project structure, update `AGENTS.md`
  (Project Structure and Build And Test Commands sections), `README.md`
  (if public API changes), and `DEVELOPMENT.md` (if local setup
  changes).
- When modifying CI workflows, ensure `prepare-release.yml` and
  `publish-release.yml` stay in sync. The version is derived from git
  tags (not `package.json`).

### Releases & CI/CD

- **Version source**: The version is derived from git tags, not
  `package.json`. The source `package.json` has no `version` field.
- **Release flow**: The release process follows two steps:
    1. **Create release PR** — Trigger `prepare-release.yml` via
       `workflow_dispatch` with the desired tag (e.g. `v0.1.0`). This
       calls `create-release-pr` which finalizes the `[Unreleased]`
       section in `CHANGELOG.md` and opens a PR.
    2. **Merge the PR** — Review and merge the release PR. The
       `publish-release.yml` workflow triggers automatically on merge,
       reads the latest version from `CHANGELOG.md`, creates the
       matching `v{version}` tag, builds, tests, publishes to npm,
       mirrors to the public repo, creates a GitHub Release, and sends
       a Slack notification.
- **Manual release**: `publish-release.yml` can also be triggered
  manually via `workflow_dispatch` with a ref input (useful for
  re-running a failed release).
- **Version injection**: CI injects the tag version into `package.json`
  via `npm pkg set version=X` before building, so the published npm
  package has the correct version.
- **No manual version bumps**: Never change `package.json` version by
  hand. Use the **Prepare release** workflow to start a release.
- **Changelog format**: `CHANGELOG.md` follows
  [Keep a Changelog](https://keepachangelog.com/) with version headings
  in bracket format (`## [X.Y.Z] - YYYY-MM-DD`).

### Markdown Formatting

All Markdown files MUST follow these formatting rules:

- **Line length**: Keep lines at most 80 characters, but do not wrap
  lines artificially short just to hit the limit. Lines inside fenced
  code blocks are exempt from this limit.
- **Unordered lists**: Use dashes (`-`) for bullet points. Indent nested
  list items by 4 spaces.
- **Continuation lines**: When a list item wraps to the next line, align
  the continuation with the first character of the item text, not the
  list marker.
- **Emphasis**: Use asterisks (`*`) for emphasis (`*italic*`,
  `**bold**`). Do NOT use underscores.
- **Headings**: Duplicate heading names are allowed only among sibling
  headings (same parent level). Avoid duplicates across different levels.
- **Inline HTML**: Avoid raw HTML in Markdown. The only allowed elements
  are `<a>`, `<p>`, `<details>`, `<summary>`, and `<img>`.
- **Trailing spaces**: Do NOT leave trailing whitespace on any line. Do
  NOT use two-space line breaks — use a blank line instead.
- **Bare URLs**: Bare URLs are permitted and do not need to be wrapped
  in angle brackets.
- **Table formatting**: Align table columns with padding when the table
  fits within 80 characters. If the table exceeds 80 characters, switch
  to a compact format using single spaces only.
