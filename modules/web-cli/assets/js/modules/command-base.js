import CommandInfra from './command-infra';

export default class CommandBase extends ArgsObject {
	static getInstanceType() {
		return 'CommandBase';
	}

	/**
	 * Get info of command.
	 *
	 * Use to provide 'extra' information about the command.
	 *
	 * @returns {Object}
	 */
	static getInfo() {
		return {};
	}

	/**
	 * Current component.
	 *
	 * @type {Component}
	 */
	component;

	/**
	 * Function constructor().
	 *
	 * Create Commands Base.
	 *
	 * @param [args={}]
	 * @param [commandsAPI={}]
	 */
	constructor( args, commandsAPI = $e.commands ) {
		super( args );

		// Acknowledge self about which command it run.
		this.currentCommand = commandsAPI.getCurrentLast();

		// Assign instance of current component.
		this.component = commandsAPI.getComponent( this.currentCommand );

		// Who ever need do something before without `super` the constructor can use `initialize` method.
		this.initialize( args );

		// Refresh args, maybe the changed via `initialize`.
		args = this.args;

		// Validate args before run.
		this.validateArgs( args );
	}

	/**
	 * Function requireContainer().
	 *
	 * Validate `arg.container` & `arg.containers`.
	 *
	 * @param {{}} args
	 *
	 * @throws {Error}
	 */
	requireContainer( args = this.args ) {
		if ( ! args.container && ! args.containers ) {
			throw Error( 'container or containers are required.' );
		}

		if ( args.container && args.containers ) {
			throw Error( 'container and containers cannot go together please select one of them.' );
		}

		const containers = args.containers || [ args.container ];

		containers.forEach( ( container ) => {
			this.requireArgumentInstance( 'container', elementorModules.editor.Container, { container } );
		} );
	}
}
