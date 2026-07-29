#!/usr/bin/env node

/**
 * Snapshots the compiled plugin assets into a comparable directory tree.
 *
 * Used to prove output parity between the legacy Grunt/Webpack pipeline and the
 * Vite/Rolldown pipeline. Run once per toolchain, then diff with compare-builds.mjs.
 */

import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const ROOT = process.cwd();
const DEFAULT_OUTPUT_DIR = '.build-baseline';

const SNAPSHOT_SOURCES = [
	{ src: 'assets/js', dest: 'assets/js' },
	{ src: 'assets/css', dest: 'assets/css' },
	{ src: 'assets/data', dest: 'assets/data' },
	{ src: 'assets/lib/swiper/css', dest: 'assets/lib/swiper/css' },
	{ src: 'build', dest: 'plugin' },
];

const BUILD_COMMANDS = {
	grunt: 'npx grunt styles && npx grunt scripts',
	'grunt-full': 'npx grunt build',
	vite: 'npm run styles:vite && npm run scripts:vite',
	'vite-full': 'npm run build:vite',
};

function parseArgs( argv ) {
	const args = { outputDir: DEFAULT_OUTPUT_DIR, build: 'grunt' };

	for ( let index = 0; index < argv.length; index++ ) {
		const arg = argv[ index ];

		if ( '--out' === arg ) {
			args.outputDir = argv[ ++index ];
		} else if ( arg.startsWith( '--out=' ) ) {
			args.outputDir = arg.slice( '--out='.length );
		} else if ( '--build' === arg ) {
			args.build = argv[ ++index ];
		} else if ( arg.startsWith( '--build=' ) ) {
			args.build = arg.slice( '--build='.length );
		} else if ( '--skip-build' === arg ) {
			args.build = 'none';
		}
	}

	return args;
}

function runBuild( target ) {
	if ( 'none' === target ) {
		console.log( '[snapshot] Reusing existing build output' );
		return;
	}

	const command = BUILD_COMMANDS[ target ];

	if ( ! command ) {
		throw new Error( `Unknown build target "${ target }". Expected one of: ${ Object.keys( BUILD_COMMANDS ).join( ', ' ) }, none` );
	}

	console.log( `[snapshot] Running: ${ command }` );
	execSync( command, { cwd: ROOT, stdio: 'inherit' } );
}

function collectFiles( directory, files = [] ) {
	if ( ! existsSync( directory ) ) {
		return files;
	}

	for ( const entry of readdirSync( directory, { withFileTypes: true } ) ) {
		const fullPath = join( directory, entry.name );

		if ( entry.isDirectory() ) {
			collectFiles( fullPath, files );
			continue;
		}

		files.push( fullPath );
	}

	return files;
}

function copyDirectory( snapshotRoot, sourceRelative, destinationRelative ) {
	const sourcePath = join( ROOT, sourceRelative );

	if ( ! existsSync( sourcePath ) ) {
		console.warn( `[snapshot] Skipping missing source: ${ sourceRelative }` );
		return;
	}

	const destinationPath = join( snapshotRoot, destinationRelative );

	mkdirSync( dirname( destinationPath ), { recursive: true } );
	cpSync( sourcePath, destinationPath, { recursive: true, force: true } );
	console.log( `[snapshot] Copied ${ sourceRelative }` );
}

function writeManifest( snapshotRoot ) {
	const manifest = {};

	for ( const filePath of collectFiles( snapshotRoot ) ) {
		const relativePath = relative( snapshotRoot, filePath ).replace( /\\/g, '/' );

		manifest[ relativePath ] = {
			size: statSync( filePath ).size,
			sha256: createHash( 'sha256' ).update( readFileSync( filePath ) ).digest( 'hex' ),
		};
	}

	writeFileSync( join( snapshotRoot, 'manifest.json' ), JSON.stringify( manifest, null, 2 ) + '\n', 'utf8' );

	return Object.keys( manifest ).length;
}

function main() {
	const { outputDir, build } = parseArgs( process.argv.slice( 2 ) );
	const snapshotRoot = join( ROOT, outputDir );

	runBuild( build );

	if ( existsSync( snapshotRoot ) ) {
		rmSync( snapshotRoot, { recursive: true, force: true } );
	}

	mkdirSync( snapshotRoot, { recursive: true } );

	for ( const { src, dest } of SNAPSHOT_SOURCES ) {
		copyDirectory( snapshotRoot, src, dest );
	}

	const fileCount = writeManifest( snapshotRoot );
	console.log( `[snapshot] Wrote ${ fileCount } entries to ${ outputDir }/manifest.json` );
}

main();
