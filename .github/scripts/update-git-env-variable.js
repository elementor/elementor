const { Octokit } = require( 'octokit' );
const octokit = new Octokit( {
	auth: process.env.token,
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
