import * as fs from 'fs';
import { glob } from 'glob';

import { type TranslationCallExpression } from './types';

const COMMENTS_REGEXPS = [
	// Matches translators comment block: `/* translators: %s */`.
	/\/\*[\t ]*translators:.*\*\//gm,
	// Matches translators inline comment: `// translators: %s`.
	/(\/\/)[\t ]*translators:[^\r\n]*/gm,
] as const;

const TRANSLATIONS_REGEXPS = [
	// Matches translation functions: `__('Hello', 'elementor')`, `_n('Me', 'Us', 2, 'elementor-pro')`.
	/\b_(?:_|n|nx|x)\(.*?,\s*(?<c>['"`])[\w-]+\k<c>\s*?\)/gs,
] as const;

export function createStringsFilePath( path: string, suffix = '.strings.js' ) {
	return path.replace( /(\.min)?\.js$/i, suffix );
}

export function getFilesPaths( pattern: string ) {
	return glob( pattern, {
		ignore: {
			ignored: ( p ) => ! /\.(js|ts|jsx|tsx)$/.test( p.name ),
			childrenIgnored: ( p ) => p.isNamed( '__tests__' ) || p.isNamed( '__mocks__' ),
		},

		/**
		 * Fix for Windows paths escaping.
		 * Note: This means we don't support paths with special character (like `*`,`?`, etc.)
		 * and only allow patterns that are constructed using `path.join()` or `path.resolve()`.
		 *
		 * @see https://github.com/isaacs/node-glob#options
		 * @see https://github.com/isaacs/node-glob#windows
		 * @see https://github.com/isaacs/node-glob/issues/212#issuecomment-1449062925
		 */
		windowsPathsNoEscape: true,
	} );
}

export function getFilesContents( paths: string[] ) {
	return Promise.all( paths.map( ( filePath ) => fs.promises.readFile( filePath, 'utf-8' ) ) );
}

export function generateStringsFileContent( contents: string[] ) {
	return (
		contents
			.map( ( content ) => extractExpressions( content ) )
			.flat()
			// Add a semicolon when needed.
			.map( ( expr ) => `${ expr.value }${ expr.type === 'comment' ? '' : ';' }` )
			// Join all the expressions to a single string with line-breaks between them.
			.join( '\n' )
	);
}

function extractExpressions( content: string ): TranslationCallExpression[] {
	const expressions: TranslationCallExpression[] = [];

	[ ...TRANSLATIONS_REGEXPS, ...COMMENTS_REGEXPS ].forEach( ( regexp ) => {
		[ ...content.matchAll( regexp ) ].forEach( ( res ) => {
			expressions.push( {
				type: COMMENTS_REGEXPS.includes( regexp ) ? 'comment' : 'call-expression',
				index: res.index || 0,
				value: res[ 0 ],
			} );
		} );
	} );

	// Sort by the index it was found in the file based on the regexp (and not by the order it was added to the array).
	return expressions.sort( ( a, b ) => a.index - b.index );
}
