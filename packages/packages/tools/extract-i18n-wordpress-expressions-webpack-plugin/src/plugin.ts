import * as fs from 'fs';
import * as path from 'path';
import { type Compilation, type Compiler } from 'webpack';

import { type EntrySettings } from './types';
import { createStringsFilePath, generateStringsFileContent, getFilesContents, getFilesPaths } from './utils';

type Options = {
	pattern: ( entryPath: string, entryId: string ) => string;
};

export default class ExtractI18nWordpressExpressionsWebpackPlugin {
	options: Options;

	constructor( options: Options ) {
		this.options = options;
	}

	apply( compiler: Compiler ) {
		compiler.hooks.afterEmit.tapPromise( this.constructor.name, async ( compilation ) => {
			const entries = this.getEntries( compilation );

			await Promise.all(
				entries.map( async ( entry ) => {
					const fileContents = await getFilesContents( await getFilesPaths( entry.pattern ) );

					const entryContent = generateStringsFileContent( fileContents );

					// Writing manually instead of using `chunk.files.add()` in order to avoid passing
					// the file through the loaders (transpilers, minifiers, etc.).
					await fs.promises.writeFile( entry.path, entryContent );
				} )
			);
		} );
	}

	getEntries( compilation: Compilation ) {
		return [ ...compilation.entrypoints ]
			.map( ( [ id, entrypoint ] ) => {
				const chunk = entrypoint.chunks.find( ( { name } ) => name === id );

				if ( ! chunk ) {
					return null;
				}

				const chunkJSFile = [ ...chunk.files ].find( ( f ) => /\.(js|ts)$/i.test( f ) );

				if ( ! chunkJSFile ) {
					return null;
				}

				const { path: basePath } = compilation.options.output;

				if ( ! basePath ) {
					return null;
				}

				const filePath = createStringsFilePath( compilation.getPath( '[file]', { filename: chunkJSFile } ) );

				return {
					id,
					chunk,
					path: path.join( basePath, filePath ),
					pattern: this.options.pattern( path.resolve( process.cwd(), entrypoint.origins[ 0 ].request ), id ),
				};
			} )
			.filter( Boolean ) as EntrySettings[];
	}
}
