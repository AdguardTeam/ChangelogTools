// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';

export default defineConfig({
    define: {
        __IS_TEST__: true,
    },
    test: {
        watch: false,
        include: [
            'test/**/*.test.ts',
        ],
        coverage: {
            include: [
                'src/**/*.ts',
            ],
            exclude: [
                'src/**/*.test.ts',
            ],
        },
    },
});
