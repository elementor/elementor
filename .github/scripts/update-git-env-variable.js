const { Octokit } = require( 'octokit' );
const octokit = new Octokit( {
	auth: process.env.token,
} )

const { repository_id, environment_name, name, value, vars } = process.env;

console.log( {vars} );
(async () => {
	octokit.rest.actions.updateEnvironmentVariable( {
		repository_id,
		environment_name,
		name,
		value,
	} );
} )()
