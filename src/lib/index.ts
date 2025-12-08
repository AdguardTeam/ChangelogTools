/**
 * @file Main entry point for the changelog-tools library.
 */

// Export core functionality
export { extractRelease } from './extractor.js';
export { parseMd } from './parser.js';
export { serializationOptions, type ExtractOptions } from './types.js';
