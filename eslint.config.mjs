import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import parser from "vue-eslint-parser";
import path from "node:path";
import {fileURLToPath} from "node:url";
import js from "@eslint/js";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/*.guard.ts", "**/*.js", "**/capacitor.config.ts", "**/eslint.config.mjs"],
}, ...compat.extends(
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/base",
), {
    plugins: {
        "@typescript-eslint": typescriptEslintPlugin,
    },

    languageOptions: {
        globals: {
            //...vue.environments["setup-compiler-macros"]["setup-compiler-macros"],
        },

        parser: parser,
        ecmaVersion: 2020,
        sourceType: "commonjs",

        parserOptions: {
            project: "./tsconfig.json",
            parser: "@typescript-eslint/parser",
        },
    },

    rules: {
        "no-console": "off",
        "no-debugger": "off",
        "vue/no-deprecated-slot-attribute": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-non-null-assertion": "off",

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
        }],

        "vue/script-setup-uses-vars": "error",
        "vue/v-on-event-hyphenation": "off",
        "no-redeclare": ["error", {
            builtinGlobals: false,
        }],
    },
}, {
    files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],

    languageOptions: {
        globals: {
            ...globals.jest,
        },
    },
}];