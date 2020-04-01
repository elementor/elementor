import Commands from './commands.js';

export default class Data extends Commands {
	runCustom( type, endpoint, args ) {
		args.options.type = type;

		const command = $e.utils.data.endpointToCommand( endpoint, args );

		return this.run( command, args );
	}

	create( endpoint, query = {}, options = {} ) {
		return this.runCustom( 'create', endpoint, { query, options } );
	}

	delete( endpoint, query = {}, options = {} ) {
		return this.runCustom( 'delete', endpoint, { query, options } );
	}

	get( endpoint, query = {}, options = {} ) {
		return this.runCustom( 'get', endpoint, { query, options } );
	}

	update( endpoint, query = {}, options = {} ) {
		return this.runCustom( 'update', endpoint, { query, options } );
	}

	error( message ) {
		throw Error( 'Data commands: ' + message );
	}
}
