/**
 * @file File system utilities.
 */

import { mkdir } from 'node:fs/promises';

/**
 * Ensures that a directory exists. Creates the directory and its parent directories if they don't exist.
 *
 * @param dirPath Path to the directory.
 */
export const ensureDir = async (dirPath: string): Promise<void> => {
    await mkdir(dirPath, { recursive: true });
};
