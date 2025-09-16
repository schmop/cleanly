import eslint from "@eslint/js";
import vuePlugin from "eslint-plugin-vue";
import globals from "globals";

import {defineConfigWithVueTs, vueTsConfigs,} from '@vue/eslint-config-typescript';
import tseslint from 'typescript-eslint';
import vueParser from "vue-eslint-parser"
import tsParser from "@typescript-eslint/parser"


const config = defineConfigWithVueTs(
    vueTsConfigs.recommendedTypeChecked,
    {
        ignores: [
            "**/*.guard.ts",
            "**/*.js",
            "**/capacitor.config.ts",
            "**/eslint.config.mjs",
            "babel.config.cjs",
            "jest.config.cjs",
            "bin/**",
        ],
    },
    vuePlugin.configs["flat/recommended"],
    vuePlugin.configs["flat/base"],
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.eslintRecommended,
    tseslint.configs.recommended,
    {
        rules: {
            "no-console": "off",
            "no-debugger": "off",
            "vue/no-deprecated-slot-attribute": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": ["error",
                {
                    "args": "all",
                    "argsIgnorePattern": "^_",
                    "caughtErrors": "all",
                    "caughtErrorsIgnorePattern": "^_",
                    "destructuredArrayIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "ignoreRestSiblings": true
                }
            ],
            //"@typescript-eslint/explicit-function-return-type": "error",

            //"vue/script-setup-uses-vars": "error",
            "vue/v-on-event-hyphenation": "off",
            "no-redeclare": ["error", {
                builtinGlobals: false,
            }],
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            }
        }
    },
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
            }
        },
    },
    // {
    //     files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],

    //     languageOptions: {
    //         globals: {
    //             ...globals.jest,
    //         },
    //     },
    // }
);

// console.log(config);

export default config;