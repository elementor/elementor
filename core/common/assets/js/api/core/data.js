import Commands from './commands.js';

export default class Data extends Commands {
	run( command, args = {} ) {
		// Assuming the command maybe index.
		if ( ! this.commands[ command ] ) {
			command = command + '/index';
		}

		return super.run( command, args );
	}

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
