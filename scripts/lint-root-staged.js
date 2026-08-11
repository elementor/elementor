#!/usr/bin/env node

const { execSync } = require( 'child_process' );
const path = require( 'path' );

const PACKAGES_SEGMENT = `${ path.sep }packages${ path.sep }`;

const files = process.argv.slice( 2 );

if ( files.length === 0 ) {
	process.exit( 0 );
}

const rootFiles = files.filter( ( file ) => {
	const normalized = path.normalize( file );
	return ! normalized.includes( PACKAGES_SEGMENT ) && ! normalized.startsWith( `packages${ path.sep }` );
} );

if ( rootFiles.length === 0 ) {
	process.exit( 0 );
}

try {
	execSync(
		`npx eslint --fix ${ rootFiles.map( ( f ) => `"${ f }"` ).join( ' ' ) }`,
		{
			stdio: 'inherit',
		},
	);
} catch ( error ) {
	console.error( 'Lint failed for root files:', error.message );
	process.exit( 1 );
}
