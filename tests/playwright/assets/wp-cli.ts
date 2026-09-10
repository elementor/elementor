const PLAYGROUND_TARGET = 'playground';
const PLAYGROUND_DEFAULT_URL = 'http://127.0.0.1:9400';
const PLAYGROUND_BRIDGE_PATH = '/wp-content/plugins/elementor/tests/playwright/playground/wp-cli-bridge.php';

const isPlaygroundTarget = () => process.env.WP_CLI_TARGET === PLAYGROUND_TARGET;

const runOnPlayground = async ( command: string ) => {
	const baseUrl = process.env.PLAYGROUND_URL || PLAYGROUND_DEFAULT_URL;

	const response = await fetch( `${ baseUrl }${ PLAYGROUND_BRIDGE_PATH }`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( { command } ),
	} );

	const raw = await response.text();

	if ( ! response.ok ) {
		throw new Error( `wpCli (playground) failed: ${ command }\nHTTP ${ response.status }\n${ raw }` );
	}

	if ( ! raw.startsWith( '{' ) ) {
		throw new Error( `wpCli (playground) bridge did not run - got a non-JSON response for: ${ command }\n${ raw }` );
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
