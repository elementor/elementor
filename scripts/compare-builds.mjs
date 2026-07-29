#!/usr/bin/env node

/**
 * Compares two build snapshots produced by build-baseline.mjs.
 *
 * Structural parity (which files exist) is enforced for every tree. Content parity is
 * enforced for artifacts whose bytes are part of the runtime contract: CSS, generated
 * PHP asset manifests and JSON data files. JavaScript bundles are only size-checked,
 * since two different bundlers legitimately emit different module wrappers.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

const COMPARED_TREES = [ 'assets/js', 'assets/css', 'assets/data', 'assets/lib', 'plugin' ];

const IGNORED_FILE_SUFFIXES = [ '.map', '.LICENSE.txt' ];

const IGNORED_RELATIVE_PATHS = [
	/^manifest\.json$/,
	/(^|\/)qunit-tests(\.min)?\.js$/,
	/(^|\/)\.DS_Store$/,
];

const HASHED_CHUNK_PATTERNS = [
	{ pattern: /^[a-f0-9]{8,}\.bundle(\.min)?\.js$/, replace: () => '{hash}.bundle.js' },
	{ pattern: /^(.+)\.[A-Za-z0-9_-]{8,}\.bundle(\.min)?\.js$/, replace: ( name ) => name.replace( /\.[A-Za-z0-9_-]{8,}\.bundle/, '.{hash}.bundle' ) },
];

const SIZE_DELTA_RATIO_THRESHOLD = 0.5;
const SIZE_DELTA_BYTES_THRESHOLD = 1024;
const MAX_REPORTED_ITEMS = 40;

const BANNER_PATTERN = /^\/\*![^\n]*\*\/\s*/;
const SOURCE_MAPPING_PATTERN = /\/\*#\s*sourceMappingURL=[^*]*\*\/\s*$/;

function parseArgs( argv ) {
	const positional = argv.filter( ( arg ) => ! arg.startsWith( '--' ) );

	return {
		baselineDir: positional[ 0 ] || '.build-baseline',
		candidateDir: positional[ 1 ] || '.vite-build',
		strictContent: ! argv.includes( '--no-content' ),
	};
}

function shouldIgnore( relativePath ) {
	if ( IGNORED_FILE_SUFFIXES.some( ( suffix ) => relativePath.endsWith( suffix ) ) ) {
		return true;
	}

	return IGNORED_RELATIVE_PATHS.some( ( pattern ) => pattern.test( relativePath ) );
}

function normalizeFileName( fileName ) {
	for ( const { pattern, replace } of HASHED_CHUNK_PATTERNS ) {
		if ( pattern.test( fileName ) ) {
			return replace( fileName );
		}
	}

	return fileName;
}

function normalizeRelativePath( relativePath ) {
	const parts = relativePath.split( '/' );
	parts[ parts.length - 1 ] = normalizeFileName( parts[ parts.length - 1 ] );

	return parts.join( '/' );
}

function collectFiles( rootDir, currentDir = rootDir, collected = new Map() ) {
	if ( ! existsSync( currentDir ) ) {
		return collected;
	}

	for ( const entry of readdirSync( currentDir, { withFileTypes: true } ) ) {
		const fullPath = join( currentDir, entry.name );
		const relativePath = fullPath.slice( rootDir.length + 1 ).replace( /\\/g, '/' );

		if ( entry.isDirectory() ) {
			collectFiles( rootDir, fullPath, collected );
			continue;
		}

		if ( shouldIgnore( relativePath ) ) {
			continue;
		}

		collected.set( normalizeRelativePath( relativePath ), {
			relativePath,
			fullPath,
			size: statSync( fullPath ).size,
		} );
	}

	return collected;
}

function isHashedChunk( normalizedPath ) {
	return normalizedPath.includes( '{hash}.bundle' );
}

function isContentCriticalPath( relativePath ) {
	return relativePath.endsWith( '.css' ) ||
		relativePath.endsWith( '.asset.php' ) ||
		relativePath.endsWith( '.json' ) ||
		relativePath.endsWith( '.strings.js' );
}

function stableStringify( value ) {
	if ( null === value || 'object' !== typeof value ) {
		return JSON.stringify( value );
	}

	if ( Array.isArray( value ) ) {
		return `[${ value.map( stableStringify ).join( ',' ) }]`;
	}

	return `{${ Object.keys( value ).sort().map( ( key ) => `${ JSON.stringify( key ) }:${ stableStringify( value[ key ] ) }` ).join( ',' ) }}`;
}

function normalizeContent( relativePath, fullPath ) {
	let content = readFileSync( fullPath, 'utf8' );

	if ( relativePath.endsWith( '.json' ) ) {
		return stableStringify( JSON.parse( content ) );
	}

	// The Webpack pipeline emitted translation expressions in a non-deterministic file order,
	// so these are compared as a set of expressions rather than as an ordered document.
	if ( relativePath.endsWith( '.strings.js' ) ) {
		return content.split( '\n' ).sort().join( '\n' ).trim();
	}

	content = content.replace( BANNER_PATTERN, '' ).replace( SOURCE_MAPPING_PATTERN, '' );

	return content.trim();
}

function findFirstDifference( left, right ) {
	const length = Math.min( left.length, right.length );

	for ( let index = 0; index < length; index++ ) {
		if ( left[ index ] !== right[ index ] ) {
			const start = Math.max( 0, index - 40 );

			return {
				offset: index,
				baseline: left.slice( start, index + 60 ),
				candidate: right.slice( start, index + 60 ),
			};
		}
	}

	return { offset: length, baseline: left.slice( length, length + 60 ), candidate: right.slice( length, length + 60 ) };
}

function compareTree( label, baselineDir, candidateDir, strictContent ) {
	const baselineFiles = collectFiles( baselineDir );
	const candidateFiles = collectFiles( candidateDir );

	const missing = [];
	const extra = [];
	const sizeDeltas = [];
	const contentMismatches = [];

	const chunkCounts = {
		baseline: [ ...baselineFiles.keys() ].filter( isHashedChunk ).length,
		candidate: [ ...candidateFiles.keys() ].filter( isHashedChunk ).length,
	};

	for ( const [ normalizedPath, baselineMeta ] of baselineFiles ) {
		if ( isHashedChunk( normalizedPath ) ) {
			continue;
		}

		const candidateMeta = candidateFiles.get( normalizedPath );

		if ( ! candidateMeta ) {
			missing.push( baselineMeta.relativePath );
			continue;
		}

		const sizeDelta = Math.abs( candidateMeta.size - baselineMeta.size );
		const sizeRatio = baselineMeta.size > 0 ? sizeDelta / baselineMeta.size : 0;

		if ( sizeRatio > SIZE_DELTA_RATIO_THRESHOLD && sizeDelta > SIZE_DELTA_BYTES_THRESHOLD ) {
			sizeDeltas.push( { path: normalizedPath, baselineSize: baselineMeta.size, candidateSize: candidateMeta.size } );
		}

		if ( ! strictContent || ! isContentCriticalPath( baselineMeta.relativePath ) ) {
			continue;
		}

		const baselineContent = normalizeContent( baselineMeta.relativePath, baselineMeta.fullPath );
		const candidateContent = normalizeContent( candidateMeta.relativePath, candidateMeta.fullPath );

		if ( baselineContent !== candidateContent ) {
			contentMismatches.push( { path: normalizedPath, ...findFirstDifference( baselineContent, candidateContent ) } );
		}
	}

	for ( const [ normalizedPath, candidateMeta ] of candidateFiles ) {
		if ( isHashedChunk( normalizedPath ) ) {
			continue;
		}

		if ( ! baselineFiles.has( normalizedPath ) ) {
			extra.push( candidateMeta.relativePath );
		}
	}

	return { label, missing, extra, sizeDeltas, contentMismatches, chunkCounts, baselineCount: baselineFiles.size, candidateCount: candidateFiles.size };
}

function printList( title, items ) {
	console.log( `  ${ title } (${ items.length }):` );

	for ( const item of items.slice( 0, MAX_REPORTED_ITEMS ) ) {
		console.log( `    - ${ item }` );
	}

	if ( items.length > MAX_REPORTED_ITEMS ) {
		console.log( `    ... and ${ items.length - MAX_REPORTED_ITEMS } more` );
	}
}

function printReport( result ) {
	console.log( `\n=== ${ result.label } === (baseline: ${ result.baselineCount }, candidate: ${ result.candidateCount })` );

	if ( result.missing.length ) {
		printList( 'Missing in candidate', result.missing );
	}

	if ( result.extra.length ) {
		printList( 'Extra in candidate', result.extra );
	}

	if ( ! result.missing.length && ! result.extra.length ) {
		console.log( '  Structural parity: OK' );
	}

	if ( result.contentMismatches.length ) {
		console.log( `  Content mismatches (${ result.contentMismatches.length }):` );

		for ( const mismatch of result.contentMismatches.slice( 0, MAX_REPORTED_ITEMS ) ) {
			console.log( `    - ${ mismatch.path } @ offset ${ mismatch.offset }` );
			console.log( `        baseline : ${ JSON.stringify( mismatch.baseline ) }` );
			console.log( `        candidate: ${ JSON.stringify( mismatch.candidate ) }` );
		}

		if ( result.contentMismatches.length > MAX_REPORTED_ITEMS ) {
			console.log( `    ... and ${ result.contentMismatches.length - MAX_REPORTED_ITEMS } more` );
		}
	} else {
		console.log( '  Content parity: OK' );
	}

	if ( result.chunkCounts.baseline !== result.chunkCounts.candidate ) {
		console.log( `  Split chunks (informational): baseline=${ result.chunkCounts.baseline }, candidate=${ result.chunkCounts.candidate }` );
	}

	if ( result.sizeDeltas.length ) {
		console.log( `  Large size deltas (${ result.sizeDeltas.length }, informational):` );

		for ( const delta of result.sizeDeltas.slice( 0, 10 ) ) {
			console.log( `    - ${ delta.path }: baseline=${ delta.baselineSize }, candidate=${ delta.candidateSize }` );
		}
	}

	return result.missing.length > 0 || result.extra.length > 0 || result.contentMismatches.length > 0;
}

function main() {
	const { baselineDir, candidateDir, strictContent } = parseArgs( process.argv.slice( 2 ) );
	const baselineRoot = join( ROOT, baselineDir );
	const candidateRoot = join( ROOT, candidateDir );

	for ( const [ label, path ] of [ [ baselineDir, baselineRoot ], [ candidateDir, candidateRoot ] ] ) {
		if ( ! existsSync( path ) ) {
			console.error( `Missing snapshot directory ${ label }. Run scripts/build-baseline.mjs --out ${ label } first.` );
			process.exit( 1 );
		}
	}

	const trees = COMPARED_TREES.filter( ( tree ) => existsSync( join( baselineRoot, tree ) ) || existsSync( join( candidateRoot, tree ) ) );

	const hasMismatch = trees
		.map( ( tree ) => compareTree( tree, join( baselineRoot, tree ), join( candidateRoot, tree ), strictContent ) )
		.map( printReport )
		.some( Boolean );

	if ( hasMismatch ) {
		console.error( '\nParity check failed.' );
		process.exit( 1 );
	}

	console.log( '\nParity check passed.' );
}

main();
