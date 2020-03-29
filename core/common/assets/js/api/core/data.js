import Commands from './commands.js';

export default class Data extends Commands {
	create( endpoint, args = {} ) {
		args.type = 'create';

		return this.run( $e.utils.data.endpointToCommand( endpoint, args ), args );
	}

	delete( endpoint, args = {} ) {
		args.type = 'delete';

		return this.run( $e.utils.data.endpointToCommand( endpoint, args ), args );
	}

	get( endpoint, args = {} ) {
		args.type = 'get';

		return this.run( $e.utils.data.endpointToCommand( endpoint, args ), args );
	}

	update( endpoint, args = {} ) {
		args.type = 'update';

		return this.run( $e.utils.data.endpointToCommand( endpoint, args ), args );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
