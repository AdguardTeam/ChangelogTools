# DEVELOPMENT.md

## Table of Contents

- [Prerequisites](#prerequisites)
    - [Required Tools](#required-tools)
    - [Recommended Tools](#recommended-tools)
- [Getting Started](#getting-started)
    - [Clone the Repository](#clone-the-repository)
    - [Install Dependencies](#install-dependencies)
    - [Verify the Setup](#verify-the-setup)
- [Development Workflow](#development-workflow)
    - [Branching Strategy](#branching-strategy)
    - [Code Style](#code-style)
    - [Running Tests](#running-tests)
    - [Building](#building)
- [Common Tasks](#common-tasks)
    - [Running a Single Test File](#running-a-single-test-file)
    - [Running the Full CI Pipeline Locally](#running-the-full-ci-pipeline-locally)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Prerequisites

### Required Tools

<!-- markdownlint-disable MD013 -->
| Tool | Minimum Version | How to Check |
| --- | --- | --- |
| **Node.js** | 20.x | `node --version` |
| **pnpm** | 10.x | `pnpm --version` |
<!-- markdownlint-enable MD013 -->

This project uses **pnpm** as its package manager. If you need to
install it:

```bash
npm install -g pnpm
```

### Recommended Tools

- **VS Code** with the ESLint extension.
- **Docker** — for running the CI pipeline locally.

## Getting Started

### Clone the Repository

```bash
git clone git@github.com:AdGuardSoftwareLimited/ext-changelog-tools.git
cd ext-changelog-tools
```

### Install Dependencies

```bash
pnpm install
```

This installs all dependencies and sets up husky git hooks.

### Verify the Setup

Run the full check suite to confirm everything works:

```bash
pnpm lint && pnpm test && pnpm build
```

All three commands should pass without errors.

## Development Workflow

### Branching Strategy

1. Create a feature branch from `master`:

   ```bash
   git checkout master
   git pull origin master
   git checkout -b AG-XXXX-short-description
   ```

2. Make changes and commit using conventional commit messages.

3. Before pushing, run the full check suite:

   ```bash
   pnpm lint && pnpm test && pnpm build
   ```

4. Push your branch and open a pull request against `master`.

### Code Style

Code style is enforced by ESLint with the airbnb-base and
airbnb-typescript configs, plus plugins (import, jsdoc, n, boundaries).
The configuration is in `.eslintrc.cjs`.

Run the linter:

```bash
pnpm lint
```

The lint command runs TypeScript type checking (`tsc`), ESLint, and
markdownlint (`markdownlint-cli2`). For code guidelines and naming
conventions, see [AGENTS.md](./AGENTS.md).

### Running Tests

Tests are written with vitest and live in the `test/` directory.

Run all tests:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm coverage
```

### Building

Run the build:

```bash
pnpm build
```

The build uses Rollup 4 with the TypeScript plugin, producing ESM output
in `dist/` with preserved module structure, plus type declarations. A
post-build script (`scripts/transform-dts.ts`) transforms the generated
declaration files.

## Common Tasks

### Running a Single Test File

```bash
pnpm exec vitest run test/some-file.test.ts
```

### Running the Full CI Pipeline Locally

The `Dockerfile` defines a multi-stage BuildKit pipeline. To run it
locally:

```bash
DOCKER_BUILDKIT=1 docker build --progress plain --target test-output .
```

To produce the release artifact:

```bash
DOCKER_BUILDKIT=1 docker build --progress plain --target build-output --output ./artifacts .
```

The artifact `changelog-tools.tgz` will be in the `artifacts/` directory.

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
├── DEVELOPMENT.md               # This file
└── DEPLOYMENT.md                # Deployment and release process
```

## Troubleshooting

### Build Fails with Type Errors

1. Run `pnpm check-types` to see TypeScript errors directly.
2. Clear caches and rebuild:

   ```bash
   pnpm clean
   pnpm install
   pnpm build
   ```

### Tests Fail After Dependency Changes

1. Reinstall dependencies and retry:

   ```bash
   rm -rf node_modules
   pnpm install
   pnpm test
   ```

## Additional Resources

- [README.md](./README.md) — User-facing documentation and API reference
- [AGENTS.md](./AGENTS.md) — Code guidelines for LLM agents and
  contributors
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deployment and release process
- [CHANGELOG.md](./CHANGELOG.md) — Release history
- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) — Changelog
  format used by this project
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html) —
  Versioning scheme
