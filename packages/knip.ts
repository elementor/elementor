import { type KnipConfig } from 'knip';

export default {
	entry: [
		// Packages entries.
		'src/index.{js,ts,tsx}',

		// Demo app entry.
		'index.html',
	],

	typedoc: {
		config: [ 'typedoc.config.js', 'typedoc/typedoc.config.js', 'typedoc/typedoc.packages.config.js' ],
	},

	tsup: {
		config: [ 'tsup.config.ts' ],
	},

	ignore: [
		// Uses the packages from the monorepo.
		// TODO: Should be removed once test utils are handled in dedicated packages.
		'tests/setup.ts',
		'tests/test-utils/**',

		// Live in the top-level and use `tsup`, which is installed only inside the packages
		// themselves, and causes false positives.
		'tsup.build.ts',
		'tsup.dev.ts',
	],

	ignoreBinaries: [
		// Used in the CI and installed globally.
		'syncpack',
		'commitlint',
	],
} satisfies KnipConfig;
