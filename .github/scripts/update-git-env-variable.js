const { Octokit } = require( 'octokit' );
const octokit = new Octokit( {
	auth: process.env.token,
} )

const { repository_id, environment_name, name, value } = process.env;

(async () => {
	octokit.rest.actions.updateEnvironmentVariable( {
		// repository_id,
		// environment_name,
		// name,
		// value,
		repository_id: '431095051',
		environment_name: 'SCHEDULE_RELEASES',
		name: 'LAST_AUTOMATED_RELEASE',
		value: '2022-15-01T00:00:00Z',
	} );
} )()
