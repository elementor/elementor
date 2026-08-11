#!/usr/bin/env node

const { execSync } = require( 'child_process' );
const path = require( 'path' );

const PACKAGES_SEGMENT = `${ path.sep }packages${ path.sep }`;

const files = process.argv.slice( 2 );

if ( files.length === 0 ) {
	process.exit( 0 );
}

const packagesFiles = files.filter( ( file ) => {
	const normalized = path.normalize( file );
	return normalized.includes( PACKAGES_SEGMENT ) || normalized.startsWith( `packages${ path.sep }` );
} );

if ( packagesFiles.length === 0 ) {
	process.exit( 0 );
}

const relativeFiles = packagesFiles.map( ( file ) => {
	const normalized = path.normalize( file );
	const packagesIndex = normalized.lastIndexOf( PACKAGES_SEGMENT );

	if ( packagesIndex !== -1 ) {
		return normalized.slice( packagesIndex + PACKAGES_SEGMENT.length );
	}

	return normalized.replace( /^packages[/\\]/, '' );
} );

try {
	execSync(
		`npx eslint --fix ${ relativeFiles.map( ( f ) => `"${ f }"` ).join( ' ' ) }`,
		{
			cwd: path.join( __dirname, '..', 'packages' ),
			stdio: 'inherit',
		},
	);
} catch ( error ) {
	console.error( 'Lint failed for packages files:', error.message );
	process.exit( 1 );
}
