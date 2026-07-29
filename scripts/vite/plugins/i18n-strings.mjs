import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { glob } from 'glob';

const COMMENT_PATTERNS = [
	/\/\*[\t ]*translators:.*\*\//gm,
	/(\/\/)[\t ]*translators:[^\r\n]*/gm,
];

const TRANSLATION_PATTERNS = [
	/\b_(?:_|n|nx|x)\(.*?,\s*(?<c>['"`])[\w-]+\k<c>\s*?\)/gs,
];

const SOURCE_EXTENSION_PATTERN = /\.(js|ts|jsx|tsx)$/;

/**
 * Entries that expose an App bundle scan the whole App tree rather than just the directory
 * their source file happens to live in.
 */
const APP_ENTRY_NAMES = [ 'app', 'app-packages', 'app-loader' ];

function extractExpressions( content ) {
	const expressions = [];

	for ( const pattern of [ ...TRANSLATION_PATTERNS, ...COMMENT_PATTERNS ] ) {
		for ( const match of content.matchAll( pattern ) ) {
			expressions.push( {
				index: match.index || 0,
				value: match[ 0 ],
				isComment: COMMENT_PATTERNS.includes( pattern ),
			} );
		}
	}

	return expressions.sort( ( a, b ) => a.index - b.index );
}

function generateStringsFileContent( fileContents ) {
	return fileContents
		.flatMap( ( content ) => extractExpressions( content ) )
		.map( ( expression ) => `${ expression.value }${ expression.isComment ? '' : ';' }` )
		.join( '\n' );
}

export function getStringsScanPattern( entryName, entrySourcePath ) {
	const sourceDirectory = dirname( entrySourcePath );

	return APP_ENTRY_NAMES.includes( entryName )
		? resolve( sourceDirectory, '../../**/*.{js,jsx}' )
		: resolve( sourceDirectory, '**/*.{js,jsx}' );
}

/**
 * Writes `<entry>.strings.js` next to the bundle: a flat list of the translation call
 * expressions found in the entry's source tree, for WordPress' string extraction to read.
 *
 * The expressions are deliberately not taken from the bundle itself, so that minification and
 * transpilation cannot rewrite them beyond recognition.
 */
export function i18nStringsPlugin( { entryName, entrySourcePath, outputDir, scanPattern } ) {
	return {
		name: 'elementor-i18n-strings',
		async writeBundle() {
			const pattern = scanPattern ?? getStringsScanPattern( entryName, entrySourcePath );
			const filePaths = await glob( pattern, {
				ignore: {
					ignored: ( candidate ) => ! SOURCE_EXTENSION_PATTERN.test( candidate.name ),
					childrenIgnored: ( candidate ) => candidate.isNamed( '__tests__' ) || candidate.isNamed( '__mocks__' ),
				},
				windowsPathsNoEscape: true,
			} );

			// Glob resolves directories in parallel and returns them in completion order, so
			// the paths are sorted to keep the generated file reproducible between builds.
			const fileContents = await Promise.all( filePaths.sort().map( ( filePath ) => readFile( filePath, 'utf8' ) ) );

			await writeFile( join( outputDir, `${ entryName }.strings.js` ), generateStringsFileContent( fileContents ) );
		},
	};
}
