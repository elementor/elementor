// Inspired by "Dependency Extraction Webpack Plugin" by @wordpress team.
// Link: https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin
import { sources } from 'webpack';

export class ExtractDependenciesWebpackPlugin {
	options;

	constructor( options ) {
		this.options = options;
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			compilation.hooks.processAssets.tap( { name: this.constructor.name }, () => {
				[ ...compilation.entrypoints ].forEach( ( [ id, entrypoint ] ) => {
					const chunk = entrypoint.chunks.find( ( { name } ) => name === id );
					const chunkJSFile = this.getFileFromChunk( chunk );

					if ( ! chunkJSFile ) {

					}

					const deps = this.getDepsFromChunk( compilation, chunk );

					const assetFilename = this.generateAssetsFileName(
						compilation.getPath( '[file]', { filename: chunkJSFile } )
					);

					const content = this.createAssetsFileContent(
						id,
						deps,
						compilation.options.optimization.minimize
					);

					// Add source and file into compilation for webpack to output.
					compilation.assets[ assetFilename ] = new sources.RawSource( content );

					chunk.files.add( assetFilename );
				} );
			} );
		} );
	}

	getDepsFromChunk( compilation, chunk ) {
		const depsSet = new Set();

		compilation.chunkGraph.getChunkModules( chunk ).forEach( ( module ) => {
			[ ...( module.modules || [] ), module ].forEach( ( subModule ) => {
				if ( ! this.isExternalDep( subModule.userRequest ) ) {
					return;
				}

				depsSet.add( subModule.userRequest );
			} );
		} );

		return depsSet;
	}

	createAssetsFileContent( entryId, deps, shouldMinify ) {
		const handleName = this.generateHandleName( entryId );

		const depsAsString = [ ...deps ]
			.map( ( dep ) => this.transformIntoDepName( dep ) )
			.filter( ( dep ) => dep !== handleName )
			.sort()
			.map( ( dep ) => `'${ dep }',` )
			.join( '\n\t\t' );

		let content =
`<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'handle' => '${ handleName }',
	'deps' => [
		${ depsAsString }
	],
];
`;

		if ( shouldMinify ) {
			content = content
				.replaceAll( /\s/gm, '' )
				.replace( '<?php', '<?php\n' );
		}

		return content;
	}

	getFileFromChunk( chunk ) {
		return [ ...chunk.files ].find( ( f ) => /\.js$/i.test( f ) );
	}

	isExternalDep( request ) {
		const { startsWith, exact } = this.options.handlesMap;

		return request && (
			Object.keys( exact ).includes( request ) ||
			Object.keys( startsWith ).some( ( dep ) => request.startsWith( dep ) )
		);
	}

	transformIntoDepName( name ) {
		const { startsWith, exact } = this.options.handlesMap;

		if ( Object.keys( exact ).includes( name ) ) {
			return exact[ name ];
		}

		for ( const [ key, value ] of Object.entries( startsWith ) ) {
			if ( name.startsWith( key ) ) {
				return name.replace( key, value );
			}
		}

		return name;
	}

	generateHandleName( name ) {
		if ( this.options.handlePrefix ) {
			return `${ this.options.handlePrefix }${ name }`;
		}

		return name;
	}

	generateAssetsFileName( filename ) {
		return filename.replace( /(\.min)?\.js$/i, '.asset.php' );
	}
}
