import Commands from './commands.js';

export default class Data extends Commands {
	create( endpoint, args = {} ) {
		args.type = 'create';

		return this.run( endpoint, args );
	}

	delete( endpoint, args = {} ) {
		args.type = 'delete';

		return this.run( endpoint, args );
	}

	get( endpoint, args = {} ) {
		args.type = 'get';

		let commandFound = !! this.commands[ endpoint ];

		// Assuming the command maybe index.
		if ( ! commandFound && this.commands[ endpoint + '/index' ] ) {
			endpoint = endpoint + '/index';
			commandFound = true;
		}

		// Maybe the endpoint includes 'id'. as part of the endpoint.
		if ( ! commandFound ) {
			const endpointParts = endpoint.split( '/' ),
				assumedCommand = endpointParts[ 0 ] + '/' + endpointParts[ 1 ];

			if ( this.commands[ assumedCommand ] ) {
				endpoint = assumedCommand;

				// Warp with 'id'.
				args.id = endpointParts[ 2 ];
			}
		}

		return this.run( endpoint, args );
	}

	update( endpoint, args = {} ) {
		args.type = 'update';

		return this.run( endpoint, args );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
