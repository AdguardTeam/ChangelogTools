/**
 * @file Tests for file system utilities.
 */

import { rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import { ensureDir } from '../../src/utils/fs.js';

describe('ensureDir', () => {
    const testBaseDir = join(tmpdir(), 'changelog-tools-test');

    beforeEach(async () => {
        try {
            await rm(testBaseDir, { recursive: true, force: true });
        } catch {
            // Directory might not exist, which is fine
        }
    });

    afterEach(async () => {
        try {
            await rm(testBaseDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    });

    it('should create a directory that does not exist', async () => {
        const testDir = join(testBaseDir, 'test-dir-1');

        await ensureDir(testDir);

        const stats = await stat(testDir);
        expect(stats.isDirectory()).toBe(true);
    });

    it('should not throw if directory already exists', async () => {
        const testDir = join(testBaseDir, 'test-dir-2');

        await ensureDir(testDir);
        await expect(ensureDir(testDir)).resolves.not.toThrow();

        const stats = await stat(testDir);
        expect(stats.isDirectory()).toBe(true);
    });

    it('should create nested directories', async () => {
        const nestedDir = join(testBaseDir, 'level1', 'level2', 'level3');

        await ensureDir(nestedDir);

        const stats = await stat(nestedDir);
        expect(stats.isDirectory()).toBe(true);

        const level1Stats = await stat(join(testBaseDir, 'level1'));
        expect(level1Stats.isDirectory()).toBe(true);

        const level2Stats = await stat(join(testBaseDir, 'level1', 'level2'));
        expect(level2Stats.isDirectory()).toBe(true);
    });

    it('should handle deeply nested paths', async () => {
        const deepPath = join(
            testBaseDir,
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'i',
            'j',
        );

        await ensureDir(deepPath);

        const stats = await stat(deepPath);
        expect(stats.isDirectory()).toBe(true);
    });

    it('should be idempotent', async () => {
        const testDir = join(testBaseDir, 'idempotent-test');

        await ensureDir(testDir);
        await ensureDir(testDir);
        await ensureDir(testDir);

        const stats = await stat(testDir);
        expect(stats.isDirectory()).toBe(true);
    });

    it('should handle concurrent calls to same directory', async () => {
        const testDir = join(testBaseDir, 'concurrent-test');

        const promises = Array.from({ length: 10 }, () => ensureDir(testDir));

        await expect(Promise.all(promises)).resolves.toBeDefined();

        const stats = await stat(testDir);
        expect(stats.isDirectory()).toBe(true);
    });

    it('should handle concurrent calls to different nested directories', async () => {
        const promises = Array.from({ length: 5 }, (_, i) => ensureDir(join(testBaseDir, 'concurrent', `dir-${i}`)));

        await expect(Promise.all(promises)).resolves.toBeDefined();

        for (let i = 0; i < 5; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            const stats = await stat(join(testBaseDir, 'concurrent', `dir-${i}`));
            expect(stats.isDirectory()).toBe(true);
        }
    });
});
