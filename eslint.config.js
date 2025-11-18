import js from '@eslint/js';
import html from 'eslint-plugin-html';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        ignores: ['*.config.js', 'eslint.config.js'],
        plugins: {
            html,
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...globals.jquery,
                ol: 'readonly',
                swal: 'readonly',
                app: 'writable',
                QueryString: 'writable',
                Point: 'writable',
                Block: 'writable',
                map: 'writable',
                view: 'writable',
                getDirectionTo: 'writable',
                closeAllModal: 'writable',
                modalView: 'writable',
                searchEnterprise: 'writable',
                addSearchPlace: 'writable',
                moveToCurrent: 'writable',
                webkitSpeechRecognition: 'readonly',
            },
        },
        rules: {
            // Errors
            'no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'no-undef': 'error',
            'no-redeclare': 'error',
            'no-const-assign': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-func-assign': 'error',
            'no-unreachable': 'error',
            'valid-typeof': 'error',

            // Best practices
            eqeqeq: ['warn', 'always', { null: 'ignore' }],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-with': 'error',
            'no-new-func': 'error',
            'no-alert': 'off', // Using swal instead
            curly: ['warn', 'multi-line'],
            'dot-notation': 'warn',
            'no-console': 'off', // Console usage is acceptable
            'no-debugger': 'warn',

            // Variables
            'no-shadow': 'warn',
            'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],

            // Stylistic (warnings to be fixed gradually)
            indent: 'off', // Will be handled by Prettier
            quotes: 'off', // Will be handled by Prettier
            semi: 'off', // Will be handled by Prettier
            'comma-dangle': 'off', // Will be handled by Prettier
            'no-trailing-spaces': 'off', // Will be handled by Prettier
            'eol-last': 'off', // Will be handled by Prettier
            'space-before-function-paren': 'off', // Will be handled by Prettier
            'keyword-spacing': 'off', // Will be handled by Prettier
            'space-infix-ops': 'off', // Will be handled by Prettier
            'object-curly-spacing': 'off', // Will be handled by Prettier
            'array-bracket-spacing': 'off', // Will be handled by Prettier
        },
    },
    {
        files: ['**/*.html'],
        plugins: {
            html,
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...globals.jquery,
                ol: 'readonly',
                swal: 'readonly',
                app: 'readonly',
                QueryString: 'readonly',
                getDirectionTo: 'readonly',
                closeAllModal: 'readonly',
                modalView: 'readonly',
                addSearchPlace: 'readonly',
                moveToCurrent: 'readonly',
                webkitSpeechRecognition: 'readonly',
                final_transcript: 'writable',
            },
        },
        rules: {
            'no-unused-vars': 'off', // HTML scripts often have variables used in attributes
            'no-undef': 'off', // HTML scripts have inline event handlers
            'no-redeclare': 'off', // HTML scripts may redeclare globals in local scope
        },
    },
    {
        ignores: [
            'assets/bower_components/**',
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            'tests/**',
            'assets/**',
            'public/**',
            '*.config.js',
            'eslint.config.js',
        ],
    },
];
