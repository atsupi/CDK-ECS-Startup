"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var js_1 = require("@eslint/js");
var globals_1 = require("globals");
var typescript_eslint_1 = require("typescript-eslint");
var eslint_plugin_react_1 = require("eslint-plugin-react");
var config_1 = require("eslint/config");
exports.default = (0, config_1.defineConfig)([
    { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js: js_1.default }, extends: ["js/recommended"], languageOptions: { globals: globals_1.default.browser } },
    typescript_eslint_1.default.configs.recommended,
    eslint_plugin_react_1.default.configs.flat.recommended,
    eslint_plugin_react_1.default.configs.flat['jsx-runtime'],
]);
