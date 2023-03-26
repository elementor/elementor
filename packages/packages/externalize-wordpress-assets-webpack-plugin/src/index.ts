import { ExternalsPlugin, Compiler } from 'webpack';

type ExternalsMap = {
	exact: Record<string, string>;
	startsWith: Record<string, string>;
}

type NormalizedOptions = {
	globalKey: string,
	externalsMap: ExternalsMap
}

type Options = {
	globalKey: string,
	externalsMap?: Partial<ExternalsMap>
}

const baseExternalsMap: ExternalsMap = {
	exact: {
		react: 'React',
		'react-dom': 'ReactDOM',
	},
	startsWith: {
		'@elementor/': '__UNSTABLE__elementorPackages',
		'@wordpress/': 'wp',
	},
};

export class ExternalizeWordPressAssetsWebpackPlugin {
	externalPlugin: ExternalsPlugin;

	options: NormalizedOptions;

	constructor( options: Options ) {
		this.options = this.normalizeOptions( options );

		this.externalPlugin = new ExternalsPlugin(
			'window',
			( { request }, callback ) => {
				const externalRequest = this.requestToExternal( request );

				if ( externalRequest ) {
					return callback( undefined, externalRequest );
				}

				return callback();
			}
		);
	}

	apply( compiler: Compiler ) {
		this.externalPlugin.apply( compiler );

		compiler.hooks.environment.tap( this.constructor.name, () => {
			this.exportAsWindowItem( compiler );
		} );
	}

	requestToExternal( request: string | undefined ) {
		if ( ! request ) {
			return;
		}

		const { exact, startsWith } = this.options.externalsMap;

		if ( Object.keys( exact ).includes( request ) ) {
			return exact[ request ];
		}

		for ( const [ prefix, globalKey ] of Object.entries( startsWith ) ) {
			if ( request.startsWith( prefix ) ) {
				return [ globalKey, this.kebabToCamelCase( request.replace( prefix, '' ) ) ];
			}
		}
	}

	exportAsWindowItem( compiler: Compiler ) {
		compiler.options.output.enabledLibraryTypes?.push( 'window' );

		compiler.options.entry = Object.fromEntries(
			Object.entries( compiler.options.entry ).map( ( [ name, entry ] ) => [
				name,
				{
					...entry,
					library: {
						name: [ this.options.globalKey, this.kebabToCamelCase( name ) ],
						type: 'window',
					},
				},
			] )
		);
	}

	kebabToCamelCase( kebabCase: string ) {
		return kebabCase.replace(
			/-(\w)/g,
			( _, w: string ) => w.toUpperCase()
		);
	}

	normalizeOptions( options: Options ): NormalizedOptions {
		return {
			...( options || {} ),
			externalsMap: {
				exact: {
					...baseExternalsMap.exact,
					...( options?.externalsMap?.exact || {} ),
				},
				startsWith: {
					...baseExternalsMap.startsWith,
					...( options?.externalsMap?.startsWith || {} ),
				},
			},
		};
	}
}
