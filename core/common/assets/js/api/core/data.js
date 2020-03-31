import Commands from './commands.js';

export default class Data extends Commands {
	create( endpoint, query = {}, options = {} ) {
		query.type = 'create';

		return this.run( $e.utils.data.endpointToCommand( endpoint, query ), { query, options } );
	}

	delete( endpoint, query = {}, options = {} ) {
		query.type = 'delete';

		return this.run( $e.utils.data.endpointToCommand( endpoint, query ), { query, options } );
	}

	get( endpoint, query = {}, options = {} ) {
		query.type = 'get';

		return this.run( $e.utils.data.endpointToCommand( endpoint, query ), { query, options } );
	}

	update( endpoint, query = {}, options = {} ) {
		query.type = 'update';

		return this.run( $e.utils.data.endpointToCommand( endpoint, query ), { query, options } );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
