// Inspired by "Dependency Extraction Webpack Plugin" by @wordpress team.
// Link: https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin
import { type Chunk, type Compilation, type Compiler, sources } from 'webpack';

import { type RequestToHandleMap } from './types';
import { createAssetFilePath, getAssetFileContent, transformRequestToHandle } from './utils';

type Options = {
	handle: ( entryName: string ) => string;
	map: RequestToHandleMap;
};

type Module = {
	userRequest?: string;
	modules?: Module[];
};

export default class GenerateWordPressAssetFileWebpackPlugin {
	options: Options;

	constructor( options: Options ) {
		this.options = options;
	}

	apply( compiler: Compiler ) {
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			compilation.hooks.processAssets.tap( { name: this.constructor.name }, () => {
				[ ...compilation.entrypoints ].forEach( ( [ entryName, entrypoint ] ) => {
					const chunk = entrypoint.chunks.find( ( { name } ) => name === entryName );

					if ( ! chunk ) {
						return;
					}

					this.addAssetFileToEntrypoint( compilation, entryName, chunk );
				} );
			} );
		} );
	}

	addAssetFileToEntrypoint( compilation: Compilation, entryName: string, chunk: Chunk ) {
		const chunkJSFile = this.getFileFromChunk( chunk );

		if ( ! chunkJSFile ) {
			return;
		}

		const transformEntryNameToHandle = this.options.handle;

		const entryHandle = transformEntryNameToHandle( entryName );
		const depsHandles = this.getDepsHandlesFromChunk( compilation, chunk );

		const assetFilePath = createAssetFilePath( compilation.getPath( '[file]', { filename: chunkJSFile } ) );

		// Add source and file into compilation for webpack to output.
		compilation.assets[ assetFilePath ] = new sources.RawSource( getAssetFileContent( entryHandle, depsHandles ) );

		chunk.files.add( assetFilePath );
	}

	getDepsHandlesFromChunk( compilation: Compilation, chunk: Chunk ) {
		const depsSet = new Set< string >();

		compilation.chunkGraph.getChunkModules( chunk ).forEach( ( module ) => {
			// There are some issues with types in webpack, so we need to cast it.
			const theModule = module as Module;

			[ ...( theModule.modules || [] ), theModule ].forEach( ( subModule ) => {
				const depHandle = transformRequestToHandle( subModule.userRequest, this.options.map );

				if ( depHandle ) {
					depsSet.add( depHandle );
				}
			} );
		} );

		return [ ...depsSet ];
	}

	getFileFromChunk( chunk: Chunk ) {
		return [ ...chunk.files ].find( ( f ) => /\.js$/i.test( f ) );
	}
}
