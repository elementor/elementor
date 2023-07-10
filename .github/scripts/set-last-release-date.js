const { Octokit } = require( 'octokit' );
const octokit = new Octokit( {
	auth: process.env.token,
} )

const { repository_id, environment_name, name, value } = process.env;

(async () => {
	octokit.rest.actions.createEnvironmentVariable( {
		repository_id,
		environment_name,
		name,
		value,
	} );
} )()
