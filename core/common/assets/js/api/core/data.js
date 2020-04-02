import Commands from './commands.js';

export default class Data extends Commands {
	run( type, endpoint, args ) {
		args.options.type = type;

		const command = $e.utils.data.endpointToCommand( endpoint, args );

		return super.run( command, args );
	}

	create( endpoint, query = {}, options = {} ) {
		return this.run( 'create', endpoint, { query, options } );
	}

	delete( endpoint, query = {}, options = {} ) {
		return this.run( 'delete', endpoint, { query, options } );
	}

	get( endpoint, query = {}, options = {} ) {
		return this.run( 'get', endpoint, { query, options } );
	}

	update( endpoint, query = {}, options = {} ) {
		return this.run( 'update', endpoint, { query, options } );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
