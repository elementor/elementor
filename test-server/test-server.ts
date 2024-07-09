import * as os from 'node:os';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { v2 as dockerCompose } from 'docker-compose';
import { getConfig } from './config.js';
import {
	generateCliDockerfileTemplate,
	generateDockerComposeYmlTemplate,
	generateWordPressDockerfileTemplate,
	generateConfiguration,
} from './templates.js';

const waitForServer = async ( url: string, timeoutMs: number ) => {
	const startTime = Date.now();
	const sleep = ( ms: number ) => new Promise( ( r ) => setTimeout( r, ms ) );

	while ( startTime + timeoutMs < Date.now() ) {
		const response = await fetch( url );
		if ( response.ok && ( 200 === response.status || 302 === response.status ) ) {
			return true;
		}
		await sleep( 100 );
	}
	return false;
};

const start = async ( port: string ) => {
	await dockerCompose.upAll( {
		composeOptions: [ '-p', `port${ port }` ],
		cwd: runPath,
		log: true,
	} );
	await waitForServer( `http://localhost:${ port }`, 10000 );
};

const stop = async ( port: string ) => {
	await dockerCompose.downAll( {
		cwd: runPath,
		commandOptions: [ '--volumes', '--remove-orphans' ],
		composeOptions: [ '-p', `port${ port }` ],
		log: true,
	} );
};

// "docker compose -f backup/docker-compose.yml run --rm cli wp core install --url=\\\\\\\"http://localhost:8888\\\\\\\" --title=\\\\\\\"test\\\\\\\" --admin_user=admin --admin_password=password --admin_email=wordpress@example.com --skip-email"
const cli = async ( port: string, command: string ) => {
	await dockerCompose.run( 'cli', command, {
		cwd: runPath,
		commandOptions: [ '--rm' ],
		composeOptions: [ '-p', `port${ port }` ],
		log: true,
	} );
};

const commandMap: { [key: string]: ( ( port: string ) => Promise<void> ) | ( ( port: string, command: string ) => Promise<void> ) } = {
	start,
	stop,
	cli,
};
const command = process.argv[ 2 ];
if ( ! commandMap[ command ] ) {
	// eslint-disable-next-line no-console
	console.log( `Valid commands: ${ Object.keys( commandMap ).join( ', ' ) }. You used ${ command }` );
}

const getArgument = ( argumentKey: string, processArgs: string[] ) => {
	for ( let i = 3; i < processArgs.length; i++ ) {
		const argument = processArgs[ i ];
		if ( argument.startsWith( `${ argumentKey }=` ) ) {
			return argument.substring( argumentKey.length + 1 );
		}
	}
	return undefined;
};

const getConfigFilePath = ( processArgs: string[] ) => {
	return getArgument( 'config', processArgs );
};

const getCliCommand = ( processArgs: string[] ) => {
	return getArgument( 'command', processArgs );
};

const getPort = ( processArgs: string[] ) => {
	return getArgument( 'port', processArgs ) || '8888';
};

const port = getPort( process.argv );

const generateFiles = () => {
	const configFilePath = path.resolve( getConfigFilePath( process.argv ) );
	const config = getConfig( configFilePath );

	const wpContentPath = path.resolve( os.tmpdir(), `wpcontent${ port }` );
	if ( ! fs.existsSync( wpContentPath ) ) {
		fs.mkdirSync( wpContentPath );
	}
	const wpConfigPath = path.resolve( os.tmpdir(), port );
	if ( ! fs.existsSync( wpConfigPath ) ) {
		fs.mkdirSync( wpConfigPath );
	}
	const wpConfig = generateConfiguration( config, port );
	fs.writeFileSync( path.resolve( wpConfigPath, 'configure-wp.sh' ), wpConfig );

	const dockerComposeYmlTemplate = generateDockerComposeYmlTemplate( config, path.dirname( configFilePath ), port, wpConfigPath, wpContentPath );
	const wordPressDockerfileTemplate = generateWordPressDockerfileTemplate( config );
	const cliDockerfileTemplate = generateCliDockerfileTemplate( config );
	const hash = createHash( 'sha256' );
	hash.update( dockerComposeYmlTemplate + wordPressDockerfileTemplate + cliDockerfileTemplate + port );
	const runPath = path.resolve( os.tmpdir(), `${ hash.digest( 'hex' ) }` );
	if ( ! fs.existsSync( runPath ) ) {
		fs.mkdirSync( runPath );
	}
	// eslint-disable-next-line no-console
	console.log( `writing files to run path: ${ runPath }` );
	fs.writeFileSync( path.resolve( runPath, 'docker-compose.yml' ), dockerComposeYmlTemplate );
	fs.writeFileSync( path.resolve( runPath, 'WordPress.Dockerfile' ), wordPressDockerfileTemplate );
	fs.writeFileSync( path.resolve( runPath, 'CLI.Dockerfile' ), cliDockerfileTemplate );

	return runPath;
};

const runPath = generateFiles();

const cliCommand = getCliCommand( process.argv );
await commandMap[ command ]( port, cliCommand );

export const commands = {
	start,
	stop,
	cli,
};
