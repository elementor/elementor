const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
	auth: "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",
} );

// const { repository_id, environment_name, name, value } = process.env;

let CreateVar = new Promise((resolve, reject) => {
	let response = octokit.rest.actions.updateEnvironmentVariable( {
		repository_id: '431095051',
		environment_name: 'SCHEDULE_RELEASES',
		name: 'LAST_AUTOMATED_RELEASE',
		value: '2022-12-01T00:00:00Z',
	} )

	if ( response ) {
		console.log('response');
		resolve( response );
	} else {
		console.log('error');
		reject( new Error( 'error' ) );
	}
});

CreateVar.then(
	(message) => {console.log(message)},
	(error) => {console.log(error)}
);
//
//  (async () => {
// 	octokit.rest.actions.createEnvironmentVariable( {
// 		repository_id: 'davseve/elementor',
// 		environment_name: 'SCHEDULE_RELEASES',
// 		name: 'LAST_AUTOMATED_RELEASE',
// 		value: '2021-10-01T00:00:00Z',
// 	} );
// } )();



// const { Octokit } = require( 'octokit' );
// const octokit = new Octokit( {
// 	auth: process.env.token,
// 	// auth: "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",
// } )
//
// console.log('log: ', octokit, process.env)
// const { repository_id, environment_name, name, value } = process.env;
//
// (async () => {
// 	octokit.rest.actions.updateEnvironmentVariable( {
// 		// repository_id,
// 		// environment_name,
// 		// name,
// 		// value,
// 		repository_id: '431095051',
// 		environment_name: 'SCHEDULE_RELEASES',
// 		name: 'LAST_AUTOMATED_RELEASE',
// 		value: '2023-10-01T00:00:00Z',
// 	} );
// } )()
