import globals from "globals";
import pluginJs from "@eslint/js";


export default [
    {
        languageOptions: {
            globals: globals.browser
        }
    },
    {
          files: ["app/**/**/*.js"],
          ignores: [],
          rules: {
              semi: "error",
              "no-use-before-define": ["error", {
                  "functions": true,
                  "classes": true,
                  "variables": true,
                  "allowNamedExports": false
              }],
              "sort-imports": ["error", {
                  "ignoreCase": false,
                  "ignoreDeclarationSort": false,
                  "ignoreMemberSort": false,
                  "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
                  "allowSeparatedGroups": false
              }],
              "max-len": ["error", {
                  "code": 120,
                  "tabWidth": 4,
                  "ignoreUrls": true,
                  "ignoreComments": false,
                  "ignoreRegExpLiterals": true,
                  "ignoreStrings": true,
                  "ignoreTemplateLiterals": true
              }],
              quotes: ["error", "single"],
              "sort-vars": ["error", { "ignoreCase": true }],
              "getter-return": ["error", { allowImplicit: true }],
              "arrow-body-style": ["error", "as-needed"],
              "one-var": ["error", "never"],
              "require-await": "error",
              "eqeqeq": "error",
              "no-console": "error",
              "no-debugger": "error",
              "no-unused-vars": "error",
              "no-undef": "error",
              "no-var": "error",
              "no-void": "error",
              "no-throw-literal": "error",
              "no-sequences": "error",
              "no-empty": "error",
              "no-empty-function": "error",
              "no-duplicate-imports": "error",
              "no-duplicate-case": "error",
              "no-dupe-keys": "error",
              "no-dupe-args": "error",
              "no-dupe-else-if": "error",
              "no-dupe-class-members": "error",
              "no-useless-return": "error",
              "no-useless-constructor": "error",
              "no-useless-computed-key": "error",
              "no-useless-rename": "error",
              "no-useless-concat": "error",
              "no-useless-escape": "error",
              "no-useless-catch": "error",
              "no-useless-call": "error",
              "no-const-assign": "error",
              "no-else-return": "error",
              "prefer-const": "error",

          }
    },
    pluginJs.configs.recommended,
];