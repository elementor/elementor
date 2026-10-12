#!/usr/bin/env node

import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { globSync } from 'glob';
import { minimatch } from 'minimatch';

import { BUILD_DIR, ROOT } from './shared/paths.mjs';
import { PLUGIN_FILE_PATTERNS } from './shared/plugin-files.mjs';

/**
 * Markdown excluded from the distributable plugin, with explicit exceptions.
 *
 * These patterns are not folded into `PRUNED` because `glob` `ignore` drops paths before
 * `PLUGIN_FILE_PATTERNS` runs, and it does not honor `!` un-ignore rules. Putting a recursive
 * markdown glob in `PRUNED` therefore removed `modules/mcp/static-resources/` entirely; MCP
 * abilities then failed
 * to register when `Prompt_Loader::load()` returned empty descriptions.
 *
 * Order matters: the last pattern that matches a path wins (same rule as `PLUGIN_FILE_PATTERNS`).
 */
const MARKDOWN_PRUNE_PATTERNS = [
	'*.md',
	'**/*.md',
	'!modules/mcp/**/*.md',
];

/**
 * Directories that are excluded with no later re-inclusion, pruned up front so the scan does not
 * walk them at all. `vendor` and `core/**\/assets` are deliberately absent: both are excluded
 * broadly and then partially re-included.
 */
const PRUNED = [
	'**/node_modules/**',
	'.git/**',
	'.github/**',
	'.cursor/**',
	'.vscode/**',
	'.run/**',
	'app/**/assets/**',
	'assets/dev/**',
	'bin/**',
	'build/**',
	'docs/**',
	'examples/**',
	'hello-elementor/**',
	'local-site/**',
	'modules/**/assets/**',
	'packages/**',
	'php-scoper/**',
	'test-results/**',
	'tests/**',
	'tmp/**',
	'turbo.json',
	'eslint*mjs',
	'update-snapshots-linux.js',
];

/** @returns {boolean} Whether `filePath` is excluded by the ordered include/negate patterns. */
function matchesOrderedPatterns( filePath, patterns ) {
	let matched = false;

	for ( const pattern of patterns ) {
		const isNegated = pattern.startsWith( '!' );
		const matcher = isNegated ? pattern.slice( 1 ) : pattern;

		if ( ! minimatch( filePath, matcher ) ) {
			continue;
		}

		matched = ! isNegated;
	}

	return matched;
}

/**
 * Applies the patterns in order, as `PLUGIN_FILE_PATTERNS` requires: a positive pattern adds matches
 * to the set and a negative pattern removes them, so the last pattern to match a path decides.
 */
function selectPluginFiles( candidates ) {
	const selected = new Set();

	for ( const pattern of PLUGIN_FILE_PATTERNS ) {
		const isNegated = pattern.startsWith( '!' );
		const matcher = isNegated ? pattern.slice( 1 ) : pattern;

		for ( const candidate of candidates ) {
			if ( ! minimatch( candidate, matcher ) ) {
				continue;
			}

			if ( isNegated ) {
				selected.delete( candidate );
			} else {
				selected.add( candidate );
			}
		}
	}

	return [ ...selected ];
}

export function assemblePlugin() {
	const startedAt = Date.now();

	rmSync( BUILD_DIR, { recursive: true, force: true } );

	// Directory prune via `PRUNED`, then markdown prune via `MARKDOWN_PRUNE_PATTERNS`.
	const candidates = globSync( '**', {
		cwd: ROOT,
		nodir: true,
		dot: false,
		ignore: PRUNED,
		posix: true,
	} ).filter( ( candidate ) => ! matchesOrderedPatterns( candidate, MARKDOWN_PRUNE_PATTERNS ) );

	const files = selectPluginFiles( candidates );

	for ( const file of files.sort() ) {
		const destination = join( BUILD_DIR, file );

		mkdirSync( dirname( destination ), { recursive: true } );
		cpSync( join( ROOT, file ), destination );
	}

	console.log( `[vite:plugin] Assembled ${ files.length } files into build/ in ${ Date.now() - startedAt }ms` );
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	assemblePlugin();
}
