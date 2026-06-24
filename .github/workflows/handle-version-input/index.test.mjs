/**
 * Tests for handle-version-input/index.mjs
 *
 * Run with:  node --test .github/workflows/handle-version-input/index.test.mjs
 *
 * Strategy: the functions under test are not exported from index.mjs, so we
 * re-implement the same pure logic here and integration-test the full script
 * by spawning it as a child process with controlled env vars and a fake git.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const SCRIPT = resolve( __dirname, 'index.mjs' );

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Run index.mjs in a child process.
 *
 * @param {string}   version        Value for INPUT_VERSION.
 * @param {string[]} existingTags   Tags the fake `git tag -l` should return.
 * @returns {{ exitCode: number, stdout: string, stderr: string, outputs: Record<string,string> }}
 */
function runScript( version, existingTags = [] ) {
	// Create a temp dir that acts as the fake GITHUB_OUTPUT file location
	// and also houses a tiny fake `git` binary that returns canned tag output.
	const tmpDir = mkdtempSync( join( tmpdir(), 'hvi-test-' ) );
	const outputFile = join( tmpDir, 'github_output.txt' );
	const fakeBinDir = join( tmpDir, 'bin' );

	mkdirSync( fakeBinDir );
	writeFileSync( outputFile, '' );

	// Write a fake `git` script that echoes the requested tags
	const fakeGit = join( fakeBinDir, 'git' );
	const tagsOutput = existingTags.join( '\\n' );
	writeFileSync(
		fakeGit,
		`#!/bin/sh\nprintf '${tagsOutput}'\n`,
		{ mode: 0o755 }
	);

	const result = spawnSync( process.execPath, [ SCRIPT ], {
		env: {
			...process.env,
			INPUT_VERSION: version,
			GITHUB_OUTPUT: outputFile,
			PATH: `${ fakeBinDir }:${ process.env.PATH }`,
		},
		encoding: 'utf8',
	} );

	// Parse key=value lines written to GITHUB_OUTPUT
	const outputs = {};
	try {
		const raw = readFileSync( outputFile, { encoding: 'utf8' } );
		for ( const line of raw.split( '\n' ) ) {
			const eq = line.indexOf( '=' );
			if ( eq > 0 ) {
				outputs[ line.slice( 0, eq ) ] = line.slice( eq + 1 );
			}
		}
	} catch {
		// file may be empty
	}

	rmSync( tmpDir, { recursive: true, force: true } );

	return {
		exitCode: result.status,
		stdout: result.stdout,
		stderr: result.stderr,
		outputs,
	};
}

// ─── getVersion ───────────────────────────────────────────────────────────────

describe( 'getVersion', () => {
	it( 'exits 1 when INPUT_VERSION is missing', () => {
		const { exitCode, stderr } = runScript( '' );
		assert.equal( exitCode, 1 );
		assert.match( stderr, /No version provided/ );
	} );

	it( 'exits 1 when INPUT_VERSION is only whitespace', () => {
		const { exitCode, stderr } = runScript( '   ' );
		assert.equal( exitCode, 1 );
		assert.match( stderr, /No version provided/ );
	} );
} );

// ─── validateFormat ───────────────────────────────────────────────────────────

describe( 'validateFormat — valid versions', () => {
	const validVersions = [
		'1.0.0',
		'4.1.0',
		'5.20.15',
		'10.0.0',
		'4.1.0-beta1',
		'5.20.0-beta3',
		'1.0.0-beta99',
	];

	for ( const v of validVersions ) {
		it( `accepts ${ v }`, () => {
			// We only care that the format check itself passes; the tag check
			// will also run so we supply a clean tag list.
			const { exitCode, stdout } = runScript( v, [] );
			assert.match( stdout, /Version format is valid/ );
		} );
	}
} );

describe( 'validateFormat — invalid formats', () => {
	const invalidVersions = [
		'1.0',           // missing patch
		'1.0.0.0',       // extra segment
		'1.0.0-beta',    // beta without number
		'1.0.0-beta1.0', // dot inside pre-release
		'1.0.0-rc1',     // non-beta pre-release
		'v1.0.0',        // leading "v"
		'1.0.0-1',       // numeric-only pre-release
		'abc',           // not a version at all
		'1.0.0-BETA1',   // uppercase
	];

	for ( const v of invalidVersions ) {
		it( `rejects "${ v }"`, () => {
			const { exitCode, stderr } = runScript( v );
			assert.equal( exitCode, 1 );
			assert.match( stderr, /not in the correct format/ );
		} );
	}
} );

// ─── checkTagDoesNotExist ─────────────────────────────────────────────────────

describe( 'checkTagDoesNotExist', () => {
	it( 'exits 1 when tag already exists (exact match)', () => {
		const { exitCode, stderr } = runScript( '4.1.0', [ '4.1.0' ] );
		assert.equal( exitCode, 1 );
		assert.match( stderr, /already exists as a GitHub Release/ );
	} );

	it( 'exits 1 when tag exists among many tags', () => {
		const { exitCode, stderr } = runScript( '4.1.0', [ '3.0.0', '4.1.0', '5.0.0' ] );
		assert.equal( exitCode, 1 );
		assert.match( stderr, /already exists as a GitHub Release/ );
	} );

	it( 'passes when a similar-but-not-equal tag exists (prefix match safety)', () => {
		// '4.1.0' must not be matched by the presence of '4.1.0-beta1'
		const { exitCode } = runScript( '4.1.0', [ '4.1.0-beta1' ] );
		assert.equal( exitCode, 0 );
	} );

	it( 'passes when no tags exist', () => {
		const { exitCode } = runScript( '4.1.0', [] );
		assert.equal( exitCode, 0 );
	} );
} );

// ─── extractChannel ───────────────────────────────────────────────────────────

describe( 'extractChannel — stable', () => {
	const stableVersions = [ '1.0.0', '4.1.0', '5.20.15' ];
	for ( const v of stableVersions ) {
		it( `${ v } → channel=stable`, () => {
			const { outputs } = runScript( v, [] );
			assert.equal( outputs.channel, 'stable' );
		} );
	}
} );

describe( 'extractChannel — beta', () => {
	const betaVersions = [ '4.1.0-beta1', '5.20.0-beta3', '1.0.0-beta99' ];
	for ( const v of betaVersions ) {
		it( `${ v } → channel=beta`, () => {
			const { outputs } = runScript( v, [] );
			assert.equal( outputs.channel, 'beta' );
		} );
	}
} );

// ─── deriveBranch ─────────────────────────────────────────────────────────────

describe( 'deriveBranch', () => {
	const cases = [
		{ version: '4.1.0',        branch: '4.01' },
		{ version: '5.20.15',      branch: '5.20' },
		{ version: '10.0.0',       branch: '10.00' },
		{ version: '1.9.0',        branch: '1.09' },
		{ version: '4.1.0-beta1',  branch: '4.01' },
		{ version: '5.20.0-beta3', branch: '5.20' },
	];

	for ( const { version, branch } of cases ) {
		it( `${ version } → checkout_branch=${ branch }`, () => {
			const { outputs } = runScript( version, [] );
			assert.equal( outputs.checkout_branch, branch );
		} );
	}
} );

// ─── setOutput ────────────────────────────────────────────────────────────────

describe( 'setOutput', () => {
	it( 'writes both channel and checkout_branch to GITHUB_OUTPUT', () => {
		const { outputs } = runScript( '4.1.0', [] );
		assert.ok( 'channel' in outputs, 'channel key missing from GITHUB_OUTPUT' );
		assert.ok( 'checkout_branch' in outputs, 'checkout_branch key missing from GITHUB_OUTPUT' );
	} );

	it( 'does not write output on failure', () => {
		const { outputs } = runScript( 'bad-version' );
		assert.equal( Object.keys( outputs ).length, 0 );
	} );
} );

// ─── integration: happy-path end-to-end ───────────────────────────────────────

describe( 'integration — full happy path', () => {
	it( 'stable release: exits 0, correct channel and branch', () => {
		const { exitCode, stdout, outputs } = runScript( '5.20.15', [] );
		assert.equal( exitCode, 0 );
		assert.match( stdout, /Version format is valid/ );
		assert.match( stdout, /does not exist as a GitHub Release/ );
		assert.match( stdout, /Channel resolved to: stable/ );
		assert.match( stdout, /Checkout branch: 5\.20/ );
		assert.equal( outputs.channel, 'stable' );
		assert.equal( outputs.checkout_branch, '5.20' );
	} );

	it( 'beta release: exits 0, correct channel and branch', () => {
		const { exitCode, outputs } = runScript( '4.1.0-beta1', [] );
		assert.equal( exitCode, 0 );
		assert.equal( outputs.channel, 'beta' );
		assert.equal( outputs.checkout_branch, '4.01' );
	} );
} );
