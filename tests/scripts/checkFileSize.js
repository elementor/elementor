const fs = require( 'fs' );
const path = require( 'path' );

const sizeLimits = {
	'frontend.css': 73,
	'frontend.min.css': 63,
};

function findTargetFiles( startPath, targetFileNames ) {
	const foundFiles = [];

	function searchDirectory( dir ) {
		const entries = fs.readdirSync( dir, { withFileTypes: true } );
		for ( const entry of entries ) {
			const fullPath = path.join( dir, entry.name );
			if ( entry.isDirectory() ) {
				searchDirectory( fullPath );
			} else if ( targetFileNames.includes( entry.name ) ) {
				foundFiles.push( fullPath );
			}
		}
	}

	searchDirectory( startPath );
	return foundFiles;
}

const startDirectory = path.resolve( __dirname, '../../' );

const targetFileNames = Object.keys( sizeLimits );
const foundFiles = findTargetFiles( startDirectory, targetFileNames );

console.log( 'Found target files:' );
foundFiles.forEach( ( filePath ) => console.log( `- ${ filePath }` ) );

let allFilesValid = true;

foundFiles.forEach( ( filePath ) => {
	const fileName = path.basename( filePath );
	const fileSizeKB = fs.statSync( filePath ).size / 1024;
	const sizeLimitKB = sizeLimits[ fileName ];

	if ( fileSizeKB > sizeLimitKB ) {
		console.error( `Error: ${ fileName } at ${ filePath } exceeds the size limit of ${ sizeLimitKB }KB (${ fileSizeKB.toFixed( 2 ) }KB).` );
		allFilesValid = false;
	} else {
		console.log( `OK: ${ fileName } at ${ filePath } is within the size limit (${ fileSizeKB.toFixed( 2 ) }KB).` );
	}
} );

if ( 0 === foundFiles.length ) {
	console.warn( `Warning: No target files (${ targetFileNames.join( ', ' ) }) found.` );
	allFilesValid = false;
}

if ( ! allFilesValid ) {
	process.exit( 1 );
}
