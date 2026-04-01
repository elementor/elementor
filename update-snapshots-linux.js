const { spawn, exec } = require( 'child_process' );
const packageJson = require( './package.json' );

function isDockerExist() {
	return new Promise( ( resolve ) => {
		exec( 'docker -v', ( error ) => {
			resolve( ! error );
		} );
	} );
}

async function run( grep ) {
	const playwrightVersion = packageJson.devDependencies[ '@playwright/test' ];
	const workingDir = process.cwd();
	const browsers = process.env.BROWSERS || 'chromium';

	const command = 'docker run';
	const options = [
		'--rm',
		'--network host',
		`--volume ${ workingDir }:/work`,
		'--workdir /work/',
		`--env BROWSERS=${ browsers }`,
		'--interactive',
		process.env.CI ? '' : '--tty',
	];
	const image = `mcr.microsoft.com/playwright:v${ playwrightVersion.replace( '^', '' ) }-jammy`;
	const grepFlag = grep.length ? `--grep="${ grep }"` : '';
	const commandToRun = `/bin/bash -c "npm run test:playwright -- --update-snapshots ${ grepFlag }"`;

	await new Promise( ( resolve, reject ) => {
		const child = spawn( `${ command } ${ options.join( ' ' ) } ${ image } ${ commandToRun }`, {
			stdio: 'inherit',
			shell: true,
		} );

		child.on( 'close', ( code ) => {
			if ( code !== 0 ) {
				reject( new Error( `Docker process exited with code ${ code }` ) );
			} else {
				resolve();
			}
		} );
	} );
}

( async () => {
	if ( ! await isDockerExist() ) {
		// eslint-disable-next-line no-console
		console.error( 'Docker is not installed, please install it first.' );

		process.exit( 1 );
	}

	await run( process.argv.slice( 2 ) );
} )();
