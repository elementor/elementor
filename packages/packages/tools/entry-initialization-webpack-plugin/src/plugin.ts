import { BannerPlugin, Compilation, type Compiler } from 'webpack';

import { kebabToCamelCase } from './kebab-to-camel-case';

type Options = {
	initializer: ( args: InitializerArgs ) => string;
};

type InitializerArgs = Parameters< BannerPlugin[ 'banner' ] >[ 0 ] & {
	entryName: string;
};

export class EntryInitializationWebpackPlugin {
	constructor( private options: Options ) {}

	apply( compiler: Compiler ) {
		new BannerPlugin( {
			banner: ( args ) => {
				const { name } = args.chunk;

				if ( ! name ) {
					return '';
				}

				if ( ! /\.js$/.test( args.filename ) ) {
					return '';
				}

				return this.options.initializer( {
					...args,
					entryName: kebabToCamelCase( name ),
				} );
			},
			raw: true,
			footer: true,
			entryOnly: true,
			stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
		} ).apply( compiler );
	}
}
