import { type Compiler, ExternalsPlugin } from 'webpack';

import { type Global, type RequestToGlobalMap } from './types';
import { kebabToCamelCase, transformRequestToGlobal } from './utils';

type Options = {
	type: string;
	global?: ( entryName: string ) => Global;
	map: RequestToGlobalMap;
};

export default class ExternalizeWordPressAssetsWebpackPlugin {
	options: Options;

	externalPlugin: ExternalsPlugin;

	constructor( options: Pick< Options, 'map' | 'global' > ) {
		this.options = {
			map: options.map,
			global: options.global,
			type: 'window',
		};

		this.externalPlugin = new ExternalsPlugin( this.options.type, ( { request }, callback ) =>
			this.externalsPluginCallback( request, callback )
		);
	}

	apply( compiler: Compiler ) {
		this.externalPlugin.apply( compiler );

		compiler.hooks.environment.tap( this.constructor.name, () => {
			this.exposeEntry( compiler );
		} );
	}

	externalsPluginCallback( request: string | undefined, callback: ( err?: undefined, result?: Global ) => void ) {
		const global = transformRequestToGlobal( request, this.options.map );

		if ( ! global ) {
			callback();

			return;
		}

		callback( undefined, global );
	}

	exposeEntry( compiler: Compiler ) {
		compiler.options.output.enabledLibraryTypes?.push( this.options.type );

		const transformEntryNameToGlobal = this.options.global;
		const entry = compiler.options.entry;

		if ( ! transformEntryNameToGlobal ) {
			return;
		}

		compiler.options.entry = Object.entries( entry ).reduce(
			( carry, [ name, entryItem ] ) => ( {
				...carry,
				[ name ]: {
					...entryItem,
					library: {
						name: transformEntryNameToGlobal( kebabToCamelCase( name ) ),
						type: this.options.type,
					},
				},
			} ),
			{}
		);
	}
}
