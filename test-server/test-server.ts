import * as os from 'node:os';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { v2 as dockerCompose } from 'docker-compose';
import { getConfig, getConfigFilePath } from './config.js';
import {
	generateCliDockerfileTemplate,
	generateDockerComposeYmlTemplate,
	generateWordPressDockerfileTemplate,
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

const start = async () => {
	await dockerCompose.upAll( {
		cwd: runPath,
		log: true,
	} );
	await waitForServer( 'http://localhost:8888', 10000 );
};

const stop = async () => {
	await dockerCompose.downAll( {
		cwd: runPath,
		commandOptions: [ '--volumes', '--remove-orphans' ],
		log: true,
	} );
};

const commandMap: { [key: string]: () => Promise<void> } = {
	start,
	stop,
};
const command = process.argv[ 2 ];
if ( ! commandMap[ command ] ) {
	// eslint-disable-next-line no-console
	console.log( `Valid commands: ${ Object.keys( commandMap ).join( ', ' ) }. You used ${ command }` );
}

const generateFiles = () => {
	const config = getConfig( process.argv[ 3 ] );
	const configFilePath = path.resolve( getConfigFilePath( process.argv[ 3 ] ) );
	const dockerComposeYmlTemplate = generateDockerComposeYmlTemplate( config, path.dirname( configFilePath ) );
	const wordPressDockerfileTemplate = generateWordPressDockerfileTemplate( config );
	const cliDockerfileTemplate = generateCliDockerfileTemplate( config );
	const hash = createHash( 'sha256' );
	hash.update( dockerComposeYmlTemplate + wordPressDockerfileTemplate + cliDockerfileTemplate );
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

await commandMap[ command ]();

export const commands = {
	start,
	stop,
};
