'use strict';
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
	for (const name in all) {
		__defProp(target, name, { get: all[name], enumerable: true });
	}
};
const __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === 'object') || typeof from === 'function') {
		for (const key of __getOwnPropNames(from)) {
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
				});
			}
		}
	}
	return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
const index_exports = {};
__export(index_exports, {
	meta: () => meta,
	rules: () => rules,
});
module.exports = __toCommonJS(index_exports);

// src/rules/no-react-namespace.ts
const import_utils = require('@typescript-eslint/utils');
const noReactNamespace = import_utils.ESLintUtils.RuleCreator.withoutDocs({
	meta: {
		type: 'layout',
		docs: {
			description: 'Disallow using `React.useHook`.',
		},
		messages: {
			noReactNamespace: 'Do not use `React.{{hookName}}`. Import the hook directly.',
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		return {
			'CallExpression[callee.object.name="React"][callee.property.name=/use[A-Z]/]'(node) {
				context.report({
					node,
					messageId: 'noReactNamespace',
					data: {
						hookName: node.callee.property.name,
					},
				});
			},
		};
	},
});

// src/index.ts
var meta = {
	name: '@elementor/eslint-plugin-editor',
	version: '4.0.0',
};
var rules = {
	'no-react-namespace': noReactNamespace,
};
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
		meta,
		rules,
	});
