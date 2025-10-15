module.exports = {
	extends: [ '@commitlint/config-conventional' ],
	plugins: [ {
		rules: {
			'header-max-length-with-cherry-pick': ( { header, subject } ) => {
				const limit = subject?.includes( 'Cherry-pick' ) ? 110 : 100;
				return [
					header.length <= limit,
					`header must not be longer than ${ limit } characters, current length is ${ header.length }`,
				];
			},
		},
	} ],
	rules: {
		'subject-case': [ 2, 'always', 'sentence-case' ],
		'type-case': [ 2, 'always', 'sentence-case' ],
		'type-enum': [ 2, 'always', [ 'Feature', 'CI', 'New', 'Tweak', 'Fix', 'Experiment', 'Deprecate', 'Deprecated', 'Revert', 'Internal' ] ],
		'header-max-length': [ 0 ], // Disable default header-max-length
		'header-max-length-with-cherry-pick': [ 2, 'always' ],
	},
};
