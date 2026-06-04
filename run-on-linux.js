const { spawn, exec, execSync } = require( 'child_process' );

function isDockerExist() {
	return new Promise( ( resolve ) => {
		exec( 'docker -v', ( error ) => {
			resolve( ! error );
		} );
	} );
}

/**
 * Check if Docker daemon is running
 */
function isDockerRunning() {
	try {
		execSync( 'docker info', { stdio: 'pipe' } );
		return true;
	} catch {
		return false;
	}
}

/**
 * Start Docker Desktop (macOS).
 * Returns true if Docker is running after the attempt.
 */
function startDocker() {
	if ( isDockerRunning() ) {
		return true;
	}

	try {
		execSync( 'open -a Docker', { stdio: 'pipe' } );

		// Wait up to 60 seconds for Docker to become ready
		for ( let i = 0; i < 30; i++ ) {
			execSync( 'sleep 2', { stdio: 'pipe' } );
			if ( isDockerRunning() ) {
				return true;
			}
		}
	} catch {
		// Docker Desktop not found or failed to start
	}

	return isDockerRunning();
}

/**
 * Get the actual installed Playwright version so the Docker image matches exactly.
 */
function getInstalledPlaywrightVersion() {
	try {
		const version = execSync( 'npx playwright --version', { encoding: 'utf-8' } ).trim();
		return version.replace( 'Version ', '' );
	} catch {
		const packageJson = require( './package.json' );
		return packageJson.devDependencies[ '@playwright/test' ].replace( '^', '' );
	}
}

async function run( tag ) {
	const playwrightVersion = getInstalledPlaywrightVersion();

	// Mount the project at the SAME absolute path as on the host so wp-env
	// generates an identical content hash inside the container.
	const workingDir = process.cwd();

	const command = 'docker run';
	const options = [
		'--rm',
		'--network host',
		'--dns 8.8.8.8',
		'--dns 8.8.4.4',
		`--volume ${ workingDir }:${ workingDir }`,
		`--workdir ${ workingDir }`,
		'--interactive',
		process.env.CI ? '' : '--tty',
	].filter( Boolean );

	const image = `mcr.microsoft.com/playwright:v${ playwrightVersion }-jammy`;

	const setupCommands = [
		'apt-get update -qq',
		'apt-get install -y -qq unzip > /dev/null 2>&1',
		`npm run test:playwright -- --grep="${ tag }"`,
	].join( ' && ' );

	const commandToRun = `/bin/bash -c "${ setupCommands }"`;

	return new Promise( ( resolve ) => {
		const child = spawn(
			`${ command } ${ options.join( ' ' ) } ${ image } ${ commandToRun }`,
			{ stdio: 'inherit', stderr: 'inherit', shell: true },
		);

		child.on( 'close', ( code ) => resolve( code ) );
		child.on( 'error', () => resolve( 1 ) );
	} );
}

( async () => {
	if ( ! await isDockerExist() ) {
		process.stderr.write( 'Docker is not installed, please install it first.\n' );
		process.exit( 1 );
	}

	if ( ! startDocker() ) {
		process.stderr.write( 'Docker is not running and could not be started. Please start Docker Desktop.\n' );
		process.exit( 1 );
	}

	const exitCode = await run( process.argv.slice( 2 ) );
	process.exit( exitCode || 0 );
} )();
