"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@denis_bruns/(.*)$': '<rootDir>/node_modules/@denis_bruns/$1'
    },
    transformIgnorePatterns: [
        'node_modules/(?!@angular|rxjs|@denis_bruns)'
    ],
    transform: {
        '^.+\\.(ts|js|mjs|html|svg)$': [
            'jest-preset-angular',
            {
                tsconfig: 'tsconfig.json',
                stringifyContentPathRegex: '\\.html$',
                isolatedModules: true
            }
        ]
    },
    moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
    testRegex: '.*\\.test\\.ts$',
    clearMocks: true
};
exports.default = config;
