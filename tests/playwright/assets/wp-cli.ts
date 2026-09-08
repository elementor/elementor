const PLAYGROUND_TARGET = 'playground';
const PLAYGROUND_DEFAULT_URL = 'http://127.0.0.1:9400';

const isPlaygroundTarget = () => process.env.WP_CLI_TARGET === PLAYGROUND_TARGET;

const runOnPlayground = async ( command: string ) => {
	const baseUrl = process.env.PLAYGROUND_URL || PLAYGROUND_DEFAULT_URL;

	const response = await fetch( `${ baseUrl }/?elementor_test_wp_cli_bridge=1`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( { command } ),
	} );

	const payload = await response.json().catch( () => ( { error: 'Non-JSON response' } ) );

	if ( ! response.ok ) {
		throw new Error(
			`wpCli (playground) failed: ${ command }\nHTTP ${ response.status }\n${ JSON.stringify( payload ) }`,
		);
	}
};

const runOnDocker = async ( command: string ) => {
	const port = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? 8889 : 8888;

	const { cli } = await import( '@elementor/wp-lite-env' );
	await cli( port, command );
};

export const wpCli = async ( command: string ) => {
	if ( isPlaygroundTarget() ) {
		await runOnPlayground( command );
		return;
	}

	await runOnDocker( command );
};
