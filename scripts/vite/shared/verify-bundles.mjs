import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ASSETS_JS } from './paths.mjs';

/**
 * A dynamic import whose specifier is still a static string in the output was never resolved. The
 * template literal form matters: an unresolved external is emitted with backticks even when the
 * source used quotes. Interpolated specifiers compile to concatenation and never match, which is
 * what the two deliberate runtime imports of `tipsy.min.js` rely on.
 */
const STATIC_DYNAMIC_IMPORT = /\bimport\(\s*(["'`])([^"'`$]+)\1\s*\)/g;

/**
 * Only the minified bundles are scanned. The unminified ones keep JSDoc comments, and
 * `@typedef {import('elementor/...')}` annotations are indistinguishable from a real call without a
 * parser. An unresolved import appears in both variants, since they are built from the same graph.
 */
const MINIFIED_BUNDLE = '.min.js';

/**
 * Fails the build when a resolvable dynamic import survived into the output.
 *
 * IIFE output cannot code split, so every dynamic import is either inlined or rewritten to a global.
 * A specifier left behind means neither happened and the target module is simply absent, which the
 * browser then reports only as a rejected promise inside a `React.lazy` boundary or a `.then` that
 * never runs.
 *
 * This check exists because the bundler reports nothing at any log level when it declines to resolve
 * one, and because a parity check on filenames and sizes cannot see it: the entry is still emitted
 * and merely smaller. Two real cases were found this way, each of which silently removed a feature.
 * The lightbox lost its whole module to a specifier written as a template literal, and the App's
 * onboarding and site-builder routes lost theirs to a dynamic import of an external.
 */
export function verifyNoUnresolvedImports( directory = ASSETS_JS ) {
	const offences = [];

	for ( const fileName of readdirSync( directory ) ) {
		if ( ! fileName.endsWith( MINIFIED_BUNDLE ) ) {
			continue;
		}

		const code = readFileSync( join( directory, fileName ), 'utf8' );

		for ( const [ , , specifier ] of code.matchAll( STATIC_DYNAMIC_IMPORT ) ) {
			offences.push( `${ fileName }: import( '${ specifier }' )` );
		}
	}

	if ( offences.length ) {
		throw new Error(
			[
				'Unresolved dynamic imports left in the output, so the target modules are missing:',
				...offences.map( ( offence ) => `  ${ offence }` ),
				'Externals must be rewritten to a global, and first-party specifiers must be plain string literals.',
			].join( '\n' ),
		);
	}
}

/**
 * The argument list an IIFE bundle is invoked with, which is where externals arrive.
 */
const IIFE_ARGUMENTS = /\}\)\(([^)]*)\);?\s*(?:\/\/[^\n]*)?\s*$/;

const GLOBAL_ASSIGNMENT = /window\.([A-Za-z_$][\w$]*)\s*=/g;

/**
 * Fails the build when a bundle reads a global that it assigns itself.
 *
 * Externals arrive as IIFE arguments, so they are evaluated before the bundle body has run. Reading
 * one that the same bundle publishes throws a `ReferenceError` at the call, before the first line of
 * the body, and the whole bundle is lost. `SELF_PUBLISHED_REQUESTS` in `shared/externals.mjs` is how
 * such a request is kept bundled instead.
 *
 * Worth guarding because the symptom is remote from the cause: `app-packages` failing this way left
 * the App with an empty root and the only console output was a `ReferenceError` naming a global that
 * the bundle appears, from its source, to define on its first line.
 */
export function verifySelfPublishedGlobals( directory = ASSETS_JS ) {
	const offences = [];

	for ( const fileName of readdirSync( directory ) ) {
		if ( ! fileName.endsWith( MINIFIED_BUNDLE ) ) {
			continue;
		}

		const code = readFileSync( join( directory, fileName ), 'utf8' );
		const argumentList = code.match( IIFE_ARGUMENTS )?.[ 1 ];

		if ( ! argumentList ) {
			continue;
		}

		const assigned = new Set( [ ...code.matchAll( GLOBAL_ASSIGNMENT ) ].map( ( [ , name ] ) => name ) );

		for ( const name of assigned ) {
			if ( new RegExp( `\\b${ name }\\b` ).test( argumentList ) ) {
				offences.push( `${ fileName }: reads ${ name } as an external but also assigns it` );
			}
		}
	}

	if ( offences.length ) {
		throw new Error(
			[
				'Bundles consume a global they publish themselves, so they throw before their body runs:',
				...offences.map( ( offence ) => `  ${ offence }` ),
				'Add the request to SELF_PUBLISHED_REQUESTS in shared/externals.mjs so it stays bundled.',
			].join( '\n' ),
		);
	}
}
