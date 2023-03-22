import { ExternalsPlugin, Compiler } from 'webpack';

type ExternalsMap = {
	exact: Record< string, string >;
	startsWith: Record< string, string >;
}

type NormalizedOptions = {
	externalsMap: ExternalsMap
}

type Options = {
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

	constructor( options?: Options ) {
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
	}

	requestToExternal( request: string | undefined ) {
		if ( ! request ) {
			return;
		}

		const { exact, startsWith } = this.options.externalsMap;

		if ( Object.keys( exact ).includes( request ) ) {
			return exact[ request ];
		}

		for ( const [ prefix, namespace ] of Object.entries( startsWith ) ) {
			if ( request.startsWith( prefix ) ) {
				return [ namespace, this.kebabToCamelCase( request.replace( prefix, '' ) ) ];
			}
		}
	}

	kebabToCamelCase( kebabCase: string ) {
		return kebabCase.replace(
			/-(\w)/g,
			( _, w: string ) => w.toUpperCase()
		);
	}

	normalizeOptions( options?: Options ): NormalizedOptions {
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
