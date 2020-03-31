import Commands from './commands.js';

export default class Data extends Commands {
	create( endpoint, query = {}, options = {} ) {
		options.type = 'create';

		const args = { query, options };

		return this.run( $e.utils.data.endpointToCommand( endpoint, args ), args );
	}

	delete( endpoint, query = {}, options = {} ) {
		options.type = 'delete';

		const args = { query, options };

		return this.run( $e.utils.data.endpointToCommand( endpoint, args ), args );
	}

	get( endpoint, query = {}, options = {} ) {
		options.type = 'get';

		const args = { query, options };

		return this.run( $e.utils.data.endpointToCommand( endpoint, args ), args );
	}

	update( endpoint, query = {}, options = {} ) {
		options.type = 'update';

		const args = { query, options };

		return this.run( $e.utils.data.endpointToCommand( endpoint, args ), args );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
