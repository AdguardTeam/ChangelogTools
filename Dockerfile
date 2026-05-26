FROM adguard/node-ssh:22.22--0 AS base
SHELL ["/bin/bash", "-lc"]

RUN npm install -g pnpm@10.7.1

WORKDIR /changelog-tools

ENV npm_config_store_dir=/pnpm-store
ENV CI=true

# ============================================================================
# Stage: deps
# Cached until package.json / pnpm-lock.yaml changes.
# --ignore-scripts is required: package.json has "prepare": "node .husky/install.js"
# which must not run inside Docker.
# ============================================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/pnpm-store,id=changelog-tools-pnpm \
    pnpm install --frozen-lockfile --ignore-scripts

# ============================================================================
# Stage: source
# Full source copy — cached until any source file changes.
# ============================================================================
FROM deps AS source

COPY . /changelog-tools

# ============================================================================
# Stage: test
# Runs type-check, lint, tests, and build.
# Used by the test plan (PR validation) — no artifact production.
# ============================================================================
FROM source AS test

ARG BUILD_RUN_ID=""

RUN --mount=type=cache,target=/pnpm-store,id=changelog-tools-pnpm \
    mkdir -p /out && \
    echo "${BUILD_RUN_ID}" > /out/.build-run-id && \
    pnpm check-types && \
    pnpm lint && \
    pnpm test && \
    pnpm build && \
    touch /out/test.txt

FROM scratch AS test-output
COPY --from=test /out/ /

# ============================================================================
# Stage: build
# Runs full pipeline: type-check, lint, tests, build, pack.
# Produces changelog-tools.tgz and build.txt as artifacts.
# ============================================================================
FROM source AS build

ARG BUILD_RUN_ID=""

RUN --mount=type=cache,target=/pnpm-store,id=changelog-tools-pnpm \
    mkdir -p /out/artifacts && \
    echo "${BUILD_RUN_ID}" > /out/.build-run-id && \
    pnpm check-types && \
    pnpm lint && \
    pnpm test && \
    pnpm build && \
    npx tsx scripts/build-txt.ts && \
    pnpm pack --out changelog-tools.tgz && \
    mv changelog-tools.tgz /out/artifacts/ && \
    cp dist/build.txt /out/artifacts/

FROM scratch AS build-output
COPY --from=build /out/ /
