#!/usr/bin/env node
'use strict';

const { execSync } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const semver = require( 'semver' );

const { CHANNEL } = process.env;

// --- helpers ---

function getTags() {
	try {
		execSync( 'git fetch --tags', { stdio: 'pipe' } );
	} catch {
		// OK if no remote (local testing)
	}

	return execSync( 'git tag -l', { encoding: 'utf8' } )
		.trim()
		.split( '\n' )
		.filter( Boolean )
		.map( ( tag ) => tag.replace( /^v/, '' ) ); // normalize v4.1.0 → 4.1.0
}

function getPackageVersion() {
	const pkg = JSON.parse(
		fs.readFileSync( path.join( process.cwd(), 'package.json' ), 'utf8' )
	);
	return pkg.version;
}

function getStableTags( tags ) {
	return tags
		.filter( ( tag ) => /^[0-9]+\.[0-9]+\.[0-9]+$/.test( tag ) )
		.sort( semver.compare );
}

function getBetaTagsForBase( tags, base ) {
	const escaped = base.replace( /\./g, '\\.' );
	const pattern = new RegExp( `^${ escaped }-beta([0-9]+)$` );

	return tags
		.filter( ( tag ) => pattern.test( tag ) )
		.sort( ( a, b ) => {
			const nA = parseInt( a.match( /-beta([0-9]+)$/ )[ 1 ], 10 );
			const nB = parseInt( b.match( /-beta([0-9]+)$/ )[ 1 ], 10 );
			return nA - nB;
		} );
}

function writeOutput( key, value ) {
	if ( process.env.GITHUB_OUTPUT ) {
		fs.appendFileSync( process.env.GITHUB_OUTPUT, `${ key }=${ value }\n` );
	}
}

// --- calculation ---

function calculateStable( tags, desiredVersion ) {
	const stableTags = getStableTags( tags );

	if ( stableTags.length === 0 ) {
		throw new Error( 'No stable tags found.' );
	}

	const latest = stableTags[ stableTags.length - 1 ];
	const { major, minor, patch } = semver.parse( latest );

	const expectedPatch = `${ major }.${ minor }.${ patch + 1 }`;
	const expectedMinor = `${ major }.${ minor + 1 }.0`;

	if ( desiredVersion !== expectedPatch && desiredVersion !== expectedMinor ) {
		throw new Error(
			`Desired version "${ desiredVersion }" is not a valid next release.\n` +
			`Latest stable tag is "${ latest }". Expected either:\n` +
			`  patch → ${ expectedPatch }\n` +
			`  minor → ${ expectedMinor }`
		);
	}

	return { calculatedReleaseVersion: desiredVersion, latestTag: latest };
}

function calculateBeta( tags, packageVersion ) {
	const betaBaseTags = getBetaTagsForBase( tags, packageVersion );
	console.log( 'betaBaseTags', betaBaseTags );

	const latest = betaBaseTags[ betaBaseTags.length - 1 ] || null;

	console.log( 'latest', latest );

	let next;
	if ( ! latest ) {
		next = `${ packageVersion }-beta1`;                  // first beta for this base
	} else {
		const n = parseInt( latest.match( /-beta([0-9]+)$/ )[ 1 ], 10 );
		next = `${ packageVersion }-beta${ n + 1 }`;         // 4.0.0-be
		console.log( 'next', next );
		console.log( 'n', n );
	}

	return { calculatedReleaseVersion: next, latestTag: latest };
}

// --- main ---

function main() {
	if ( ! CHANNEL ) {
		console.error( 'CHANNEL env var is required (stable or beta).' );
		process.exit( 1 );
	}

	const tags = getTags();
	const packageVersion = getPackageVersion();
	let result;
	console.log( 'CHANNEL', CHANNEL );

	if ( CHANNEL === 'stable' ) {
		const desiredVersion = process.env.DESIRED_VERSION;
		if ( ! desiredVersion ) {
			console.error( 'DESIRED_VERSION env var is required for stable channel.' );
			process.exit( 1 );
		}
		result = calculateStable( tags, desiredVersion );
	} else if ( CHANNEL === 'beta' ) {
		const betaBase = ( process.env.DESIRED_VERSION || packageVersion ).replace( /-beta[0-9]+$/, '' );
		result = calculateBeta( tags, betaBase );	
		console.log( 'result', result );
	}

	const { calculatedReleaseVersion, latestTag } = result;
	console.log( 'calculatedReleaseVersion', calculatedReleaseVersion, 'latestTag', latestTag );
	const cleanVersion = calculatedReleaseVersion.replace( /-beta[0-9]+$/, '' );

	console.log( `Channel:      ${ CHANNEL }` );
	console.log( `Latest tag:   ${ latestTag || 'none' }` );
	console.log( `Next version: ${ calculatedReleaseVersion }` );
	console.log( 'packageVersion', packageVersion );

	writeOutput( 'CALCULATED_RELEASE_VERSION', calculatedReleaseVersion );
	writeOutput( 'CLEAN_PACKAGE_VERSION', cleanVersion );
	writeOutput( 'LATEST_TAG', latestTag || '' );
}

main();