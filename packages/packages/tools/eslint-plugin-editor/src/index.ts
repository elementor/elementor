import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import { noReactNamespace } from './rules/no-react-namespace';

export const meta = {
	name: process.env.PACKAGE_NAME as string,
	version: process.env.PACKAGE_VERSION as string,
} satisfies Linter.PluginMeta;

export const rules = {
	'no-react-namespace': noReactNamespace,
} satisfies Linter.PluginRules;
