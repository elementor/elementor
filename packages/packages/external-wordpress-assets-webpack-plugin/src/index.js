import { ExternalsPlugin } from 'webpack';

export class ExternalWordPressAssetsWebpackPlugin {
	externalPlugin;

	options;

	constructor( options ) {
		this.options = options;
		this.externalPlugin = new ExternalsPlugin(
			'window',
			( { request }, callback ) => {
				const externalRequest = this.requestToExternal( request );

				if ( externalRequest ) {
					return callback( null, externalRequest );
				}

				return callback();
			}
		);
	}

	apply( compiler ) {
		this.externalPlugin.apply( compiler );
	}

	requestToExternal( request ) {
		const { exact, startsWith } = this.options.externalsMap;

		if ( Object.keys( exact ).includes( request ) ) {
			return exact[ request ];
		}

		for ( const [ prefix, namespace ] of Object.entries( startsWith ) ) {
			if ( request.startsWith( prefix ) ) {
				return [ namespace, request.replace( prefix, '' ) ];
			}
		}
	}
}
