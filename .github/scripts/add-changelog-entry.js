'use strict';

const fs = require( 'fs' );

const FILES = [ 'changelog.txt', 'readme.txt' ];
const CHANGELOG_HEADER = '== Changelog ==';
const VERSION_HEADER_PATTERN = /^= ([\d.]+) - [\d-]+ =$/m;
const NEXT_VERSION_HEADER_PATTERN = /\n= [\d.]+ - [\d-]+ =/;

function parseEntry( entry ) {
	const trimmed = entry.trim();

	if ( ! trimmed ) {
		throw new Error( 'Changelog entry content is empty' );
	}

	const headerMatch = trimmed.match( VERSION_HEADER_PATTERN );

	if ( ! headerMatch ) {
		throw new Error( 'Changelog entry must start with "= X.Y.Z - YYYY-MM-DD ="' );
	}

	const bullets = trimmed
		.split( '\n' )
		.slice( 1 )
		.map( ( line ) => line.trimEnd() )
		.filter( ( line ) => line.startsWith( '* ' ) );

	if ( bullets.length === 0 ) {
		throw new Error( 'Changelog entry must include at least one "* ..." line' );
	}

	return {
		version: headerMatch[ 1 ],
		header: headerMatch[ 0 ],
		bullets,
		block: `${ headerMatch[ 0 ] }\n\n${ bullets.join( '\n' ) }\n\n`,
	};
}

function escapeVersionForRegex( version ) {
	return version.replace( /\./g, '\\.' );
}

function getVersionHeaderPattern( version ) {
	return new RegExp( `^= ${ escapeVersionForRegex( version ) } - [\\d-]+ =$`, 'm' );
}

function appendBulletsToVersion( fileContent, entry ) {
	const versionPattern = getVersionHeaderPattern( entry.version );
	const headerMatch = versionPattern.exec( fileContent );

	if ( ! headerMatch ) {
		throw new Error( `Version ${ entry.version } section not found in file` );
	}

	const sectionStart = headerMatch.index + headerMatch[ 0 ].length;
	const remainder = fileContent.slice( sectionStart );
	const nextVersionMatch = NEXT_VERSION_HEADER_PATTERN.exec( remainder );
	const sectionEnd = nextVersionMatch
		? sectionStart + nextVersionMatch.index
		: fileContent.length;

	const section = fileContent.slice( sectionStart, sectionEnd );
	const bulletsToAdd = entry.bullets.filter( ( bullet ) => ! section.includes( bullet ) );

	if ( bulletsToAdd.length === 0 ) {
		return fileContent;
	}

	const updatedSection = `${ section.trimEnd() }\n${ bulletsToAdd.join( '\n' ) }\n`;
	const suffix = fileContent.slice( sectionEnd ).replace( /^\n*/, '\n' );

	return fileContent.slice( 0, sectionStart ) + '\n' + updatedSection + suffix;
}

function prependEntry( fileContent, entry ) {
	const headerIndex = fileContent.indexOf( CHANGELOG_HEADER );

	if ( headerIndex === -1 ) {
		throw new Error( `"${ CHANGELOG_HEADER }" section not found` );
	}

	const insertAt = headerIndex + CHANGELOG_HEADER.length;
	const normalizedPrefix = fileContent.slice( 0, insertAt ).replace( /\s*$/, '\n\n' );
	const normalizedSuffix = fileContent.slice( insertAt ).replace( /^\s*/, '' );

	return `${ normalizedPrefix }${ entry.block }${ normalizedSuffix }`;
}

function updateFile( filePath, entry ) {
	const fileContent = fs.readFileSync( filePath, 'utf-8' );
	const versionPattern = getVersionHeaderPattern( entry.version );
	const updatedContent = versionPattern.test( fileContent )
		? appendBulletsToVersion( fileContent, entry )
		: prependEntry( fileContent, entry );

	if ( updatedContent === fileContent ) {
		console.log( `${ filePath }: no changes needed` );
		return false;
	}

	fs.writeFileSync( filePath, updatedContent );
	console.log( `Updated ${ filePath }` );

	return true;
}

function main() {
	const entryContent = process.env.CHANGELOG_CONTENT;

	if ( ! entryContent ) {
		console.error( 'Missing CHANGELOG_CONTENT environment variable' );
		process.exit( 1 );
	}

	const entry = parseEntry( entryContent );
	let hasChanges = false;

	for ( const filePath of FILES ) {
		hasChanges = updateFile( filePath, entry ) || hasChanges;
	}

	if ( ! hasChanges ) {
		console.log( 'No changelog updates were required' );
	}

	console.log( `VERSION=${ entry.version }` );
}

main();
