const { Octokit } = require( 'octokit' );
const octokit = new Octokit( {
	auth: process.env.token,
	// auth: "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",
} )

const { repository_id, environment_name, name, value } = process.env;

(async () => {
	octokit.rest.actions.updateEnvironmentVariable( {
		repository_id,
		environment_name,
		name,
		value,
	} );
} )()
