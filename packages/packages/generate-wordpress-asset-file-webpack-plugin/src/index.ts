// Inspired by "Dependency Extraction Webpack Plugin" by @wordpress team.
// Link: https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin
import { sources, Compilation, Compiler, Chunk } from 'webpack';

type HandlesMap = {
	exact: Record< string, string >;
	startsWith: Record< string, string >;
}

type Options = {
	handlePrefix: string;
	handlesMap?: Partial<HandlesMap>
}

type NormalizedOptions = {
	handlePrefix: string;
	handlesMap: HandlesMap;
}

type Module = {
	userRequest?: string;
	modules?: Module[];
}

const baseHandlesMap: HandlesMap = {
	exact: {
		react: 'react',
		'react-dom': 'react-dom',
	},
	startsWith: {
		'@elementor/': 'elementor-packages-',
		'@wordpress/': 'wp-',
	},
};

export class GenerateWordPressAssetFileWebpackPlugin {
	options: NormalizedOptions;

	constructor( options: Options ) {
		this.options = this.normalizeOptions( options );
	}

	apply( compiler: Compiler ) {
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			compilation.hooks.processAssets.tap( { name: this.constructor.name }, () => {
				[ ...compilation.entrypoints ].forEach( ( [ id, entrypoint ] ) => {
					const chunk = entrypoint.chunks.find( ( { name } ) => name === id );

					if ( ! chunk ) {
						return;
					}

					const chunkJSFile = this.getFileFromChunk( chunk );

					if ( ! chunkJSFile ) {
						return;
					}

					const deps = this.getDepsFromChunk( compilation, chunk );

					const assetFilename = this.generateAssetsFileName(
						compilation.getPath( '[file]', { filename: chunkJSFile } )
					);

					const content = this.createAssetsFileContent(
						id,
						deps,
						compilation.options.optimization.minimize || false
					);

					// Add source and file into compilation for webpack to output.
					compilation.assets[ assetFilename ] = new sources.RawSource( content );

					chunk.files.add( assetFilename );
				} );
			} );
		} );
	}

	getDepsFromChunk( compilation: Compilation, chunk: Chunk ) {
		const depsSet = new Set<string>();

		compilation.chunkGraph.getChunkModules( chunk ).forEach( ( module ) => {
			// There are some issues with types in webpack, so we need to cast it.
			const theModule = module as Module;

			[ ...( theModule.modules || [] ), theModule ].forEach( ( subModule ) => {
				if ( ! subModule.userRequest || ! this.isExternalDep( subModule.userRequest ) ) {
					return;
				}

				depsSet.add( subModule.userRequest );
			} );
		} );

		return depsSet;
	}

	createAssetsFileContent( entryId: string, deps: Set<string>, shouldMinify: boolean ) {
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

	getFileFromChunk( chunk: Chunk ) {
		return [ ...chunk.files ].find( ( f ) => /\.js$/i.test( f ) );
	}

	isExternalDep( request: string ) {
		const { startsWith, exact } = this.options.handlesMap;

		return request && (
			Object.keys( exact ).includes( request ) ||
			Object.keys( startsWith ).some( ( dep ) => request.startsWith( dep ) )
		);
	}

	transformIntoDepName( name: string ) {
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

	generateHandleName( name: string ) {
		if ( this.options.handlePrefix ) {
			return `${ this.options.handlePrefix }${ name }`;
		}

		return name;
	}

	generateAssetsFileName( filename: string ) {
		return filename.replace( /(\.min)?\.js$/i, '.asset.php' );
	}

	normalizeOptions( options: Options ): NormalizedOptions {
		return {
			...options,
			handlesMap: {
				exact: {
					...baseHandlesMap.exact,
					...( options?.handlesMap?.exact || {} ),
				},
				startsWith: {
					...baseHandlesMap.startsWith,
					...( options?.handlesMap?.startsWith || {} ),
				},
			},
		};
	}
}
