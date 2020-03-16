import CommandBase from './command-base';

export default class CommandData extends CommandBase {
	/**
	 * Function constructor().
	 *
	 * Create data command.
	 *
	 * @param [args={}]
	 * @param [commandsAPI={}]
	 */
	constructor( args, commandsAPI = $e.data ) {
		super( args, commandsAPI );
	}

	/**
	 * @param [args={}]
	 */
	applyCreate( args = {} ) {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * @param [args={}]
	 */
	applyDelete( args = {} ) {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * @param [args={}]
	 */
	applyGet( args = {} ) {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * @param [args={}]
	 */
	applyUpdate( args = {} ) {
		elementorModules.ForceMethodImplementation();
	}

	run() {
		let method;

		switch ( this.args.dataType ) {
			case 'create':
				method = this.applyCreate;
			break;

			case 'delete':
				method = this.applyDelete;
			break;

			case 'get':
				method = this.applyGet;
			break;

			case 'update':
				method = this.applyUpdate;
			break;

			default:
				throw Error( `Invalid type: ' ${ this.args.type } '` );
		}

		delete this.args.dataType;

		return method( this.args );
	}
}
