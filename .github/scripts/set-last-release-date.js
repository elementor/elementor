const { Octokit } = require( 'octokit' );
const octokit = new Octokit( {
	auth: process.env.GITHUB_TOKEN
} )

const { repository_id, environment_name, name, value } = process.env

(async () => {
	octokit.rest.actions.createEnvironmentVariable( {
		repository_id,
		environment_name,
		name,
		value,
	} );
} )()
