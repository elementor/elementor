import CommandsBackwardsCompatibility from './backwards-compatibility/commands';

/**
 * @typedef {import('../modules/component-base')} ComponentBase
 */
/**
 * @typedef {import('../modules/command-base')} CommandBase
 */
/**
 * @typedef {{}} Component
 */

export default class Commands extends CommandsBackwardsCompatibility {
	/**
	 * Function constructor().
	 *
	 * Create `$e.commands` API.
	 *
	 * @param {{}} args
	 */
	constructor( ...args ) {
		super( ...args );

		this.current = {};
		this.currentArgs = {};
		this.currentTrace = [];
		this.commands = {};
		this.components = {};

		this.classes = {};
	}

	/**
	 * @param {string} id
	 * @return {CommandBase} command class
	 */
	getCommandClass( id ) {
		return this.classes[ id ];
	}

	/**
	 * Function getAll().
	 *
	 * Receive all loaded commands.
	 *
	 * @return {string[]} commands
	 */
	getAll() {
		return Object.keys( this.commands ).sort();
	}

	/**
	 * Function register().
	 *
	 * Register new command.
	 *
	 * @param {ComponentBase|string} component
	 * @param {string}               command
	 * @param {Function}             callback
	 *
	 * @return {Commands} commands
	 */
	register( component, command, callback ) {
		let namespace;
		if ( 'string' === typeof component ) {
			namespace = component;
			component = $e.components.get( namespace );

			if ( ! component ) {
				this.error( `'${ namespace }' component is not exist.` );
			}
		} else {
			namespace = component.getNamespace();
		}

		const fullCommand = namespace + ( command ? '/' + command : '' );

		if ( this.commands[ fullCommand ] ) {
			this.error( `\`${ fullCommand }\` is already registered.` );
		}

		this.commands[ fullCommand ] = callback;
		this.components[ fullCommand ] = namespace;

		const shortcuts = component.getShortcuts(),
			shortcut = shortcuts[ command ];

		if ( shortcut ) {
			shortcut.command = fullCommand;
			shortcut.callback = ( event ) => this.runShortcut( fullCommand, event );
			$e.shortcuts.register( shortcut.keys, shortcut );
		}

		return this;
	}

	unregister( component, command ) {
		let namespace;
		if ( 'string' === typeof component ) {
			namespace = component;
			component = $e.components.get( namespace );

			if ( ! component ) {
				this.error( `'${ namespace }' component is not exist.` );
			}
		} else {
			namespace = component.getNamespace();
		}

		const fullCommand = namespace + ( command ? '/' + command : '' );

		if ( ! this.commands[ fullCommand ] ) {
			this.error( `\`${ fullCommand }\` not exist.` );
		}

		delete this.commands[ fullCommand ];
		delete this.components[ fullCommand ];

		const shortcuts = component.getShortcuts(),
			shortcut = shortcuts[ command ];

		if ( shortcut ) {
			$e.shortcuts.unregister( shortcut.keys, shortcut );
		}

		return this;
	}

	/**
	 * Function getComponent().
	 *
	 * Receive Component of the command.
	 *
	 * @param {string} command
	 *
	 * @return {Component} component
	 */
	getComponent( command ) {
		const namespace = this.components[ command ];

		return $e.components.get( namespace );
	}

	/**
	 * Function is().
	 *
	 * Checks if current running command is the same parameter command.
	 *
	 * @param {string} command
	 *
	 * @return {boolean} is this command the same as the one passed in the arguments
	 */
	is( command ) {
		const component = this.getComponent( command );

		if ( ! component ) {
			return false;
		}

		return command === this.current[ component.getRootContainer() ];
	}

	/**
	 * Function isCurrentFirstTrace().
	 *
	 * Checks if parameter command is the first command in trace that currently running.
	 *
	 * @param {string} command
	 *
	 * @return {boolean} is parameter command the first command in trace that currently running
	 */
	isCurrentFirstTrace( command ) {
		return command === this.getCurrentFirstTrace();
	}

	/**
	 * Function getCurrent().
	 *
	 * Receive currently running components and its commands.
	 *
	 * @param {string} container
	 *
	 * @return {{}|boolean|*} currently running components
	 */
	getCurrent( container = '' ) {
		if ( container ) {
			if ( ! this.current[ container ] ) {
				return false;
			}

			return this.current[ container ];
		}

		return this.current;
	}

	/**
	 * Function getCurrentArgs().
	 *
	 * Receive currently running command args.
	 *
	 * @param {string} container
	 *
	 * @return {{}|boolean|*} current arguments
	 */
	getCurrentArgs( container = '' ) {
		if ( container ) {
			if ( ! this.currentArgs[ container ] ) {
				return false;
			}

			return this.currentArgs[ container ];
		}

		return this.currentArgs;
	}

	/**
	 * Function getCurrentFirst().
	 *
	 * Receive first command that currently running.
	 *
	 * @return {string} first running command
	 */
	getCurrentFirst() {
		return Object.values( this.current )[ 0 ];
	}

	/**
	 * Function getCurrentLast().
	 *
	 * Receive last command that currently running.
	 *
	 * @return {string} last running command
	 */
	getCurrentLast() {
		const current = Object.values( this.current );

		return current[ current.length - 1 ];
	}

	/**
	 * Function getCurrentFirstTrace().
	 *
	 * Receive first command in trace that currently running
	 *
	 * @return {string} first command in trace
	 */
	getCurrentFirstTrace() {
		return this.currentTrace[ 0 ];
	}

	/**
	 * Function beforeRun().
	 *
	 * @param {string} command
	 * @param {*}      args
	 *
	 * @return {boolean} dependency result
	 */
	beforeRun( command, args = {} ) {
		if ( ! this.commands[ command ] ) {
			this.error( `\`${ command }\` not found.` );
		}

		this.currentTrace.push( command );

		return this.getComponent( command ).dependency( command, args );
	}

	/**
	 * Function run().
	 *
	 * Runs a command.
	 *
	 * @param {string} command
	 * @param {{}}     args
	 *
	 * @return {boolean|*} results
	 */
	run( command, args = {} ) {
		if ( ! this.beforeRun( command, args ) ) {
			return false;
		}

		const component = this.getComponent( command ),
			container = component.getRootContainer();

		this.current[ container ] = command;
		this.currentArgs[ container ] = args;

		this.trigger( 'run:before', component, command, args );

		if ( args.onBefore ) {
			args.onBefore.apply( component, [ args ] );
		}

		const results = this.commands[ command ].apply( component, [ args ] );

		// TODO: Consider add results to `$e.devTools`.
		if ( args.onAfter ) {
			args.onAfter.apply( component, [ args, results ] );
		}

		this.trigger( 'run:after', component, command, args, results );

		this.afterRun( command );

		if ( false === args.returnValue ) {
			return true;
		}

		return results;
	}

	/**
	 * Function runShortcut().
	 *
	 * Run shortcut.
	 *
	 * It's separated in order to allow override.
	 *
	 * @param {string} command
	 * @param {*}      event
	 *
	 * @return {boolean|*} result
	 */
	runShortcut( command, event ) {
		return this.run( command, event );
	}

	/**
	 * Function afterRun().
	 *
	 * Method fired after the command runs.
	 *
	 * @param {string} command
	 */
	afterRun( command ) {
		const component = this.getComponent( command ),
			container = component.getRootContainer();

		this.currentTrace.pop();

		delete this.current[ container ];
		delete this.currentArgs[ container ];
	}

	/**
	 * Function error().
	 *
	 * Throws error.
	 *
	 * @throws {Error}
	 *
	 * @param {string} message
	 */
	error( message ) {
		throw Error( `Commands: ${ message }` );
	}
}
