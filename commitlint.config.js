module.exports = {
	extends: [ '@commitlint/config-conventional' ],
	rules: {
		'subject-case': [ 2, 'always', 'sentence-case' ],
		'type-case': [ 2, 'always', 'sentence-case' ],
		'type-enum': [ 2, 'always', [ 'Feature', 'CI', 'New', 'Tweak', 'Fix', 'Experiment', 'Deprecate', 'Deprecated', 'Revert', 'Internal' ] ],
		'header-max-length': [ 2, 'always', ( parsed ) => {
			const { subject } = parsed;
			// Increase limit to 150 characters for Cherry-pick PRs
			const maxLength = subject?.includes( 'Cherry-pick' ) ? 110 : 100;
			return parsed.header.length <= maxLength;
		} ],
	},
};
