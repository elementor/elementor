import CommandBase from 'elementor-api/modules/command-base';

export default class Commands extends elementorModules.Module {
	static trace = [];

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
	}

	/**
	 * Function getAll().
	 *
	 * Receive all loaded commands.
	 *
	 * @returns {string[]}
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
	 * @param {string} command
	 * @param {function()} callback
	 *
	 * @returns {Commands}
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
	 * @returns {Component}
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
	 * @returns {boolean}
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
	 * @returns {boolean}
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
	 * @returns {{}|boolean|*}
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
	 * @returns {{}|boolean|*}
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
	 * @returns {string}
	 */
	getCurrentFirst() {
		return Object.values( this.current )[ 0 ];
	}

	/**
	 * Function getCurrentLast().
	 *
	 * Receive last command that currently running.
	 *
	 * @returns {string}
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
	 * @returns {string}
	 */
	getCurrentFirstTrace() {
		return this.currentTrace[ 0 ];
	}

	validateRun( command, args = {} ) {
		if ( ! this.commands[ command ] ) {
			this.error( `\`${ command }\` not found.` );
		}

		return this.getComponent( command ).dependency( command, args );
	}

	/**
	 * Function beforeRun().
	 *
	 * @param {string} command
	 * @param {} args
	 */
	beforeRun( command, args = {} ) {
		const component = this.getComponent( command ),
			container = component.getRootContainer();

		this.currentTrace.push( command );

		Commands.trace.push( command );

		this.current[ container ] = command;
		this.currentArgs[ container ] = args;

		if ( args.onBefore ) {
			args.onBefore.apply( component, [ args ] );
		}

		this.trigger( 'run', component, command, args );
	}

	/**
	 * Function run().
	 *
	 * Runs a command.
	 *
	 * @param {string} command
	 * @param {{}} args
	 *
	 * @returns {boolean|*} results
	 */
	run( command, args = {} ) {
		if ( ! this.validateRun( command, args ) ) {
			return false;
		}

		this.beforeRun( command, args );

		// Call to new command or callback.
		const instance = this.commands[ command ].apply( this.getComponent( command ), [ args ] );

		// TODO: Remove after all commands inheritance CommandBase.
		if ( ! instance || ! ( instance instanceof CommandBase ) ) {
			// Means instance is a result from callback and not command.
			this.afterRun( command, args, instance );

			return instance;
		}

		let results;

		this.validateInstance( instance, command );

		// For UI Hooks.
		instance.onBeforeRun( instance.args );

		try {
			// For data hooks.
			instance.onBeforeApply( instance.args );

			results = instance.run();
		} catch ( e ) {
			instance.onCatchApply( e );

			if ( e instanceof $e.modules.HookBreak ) {
				this.afterRun( command, args, e ); // To clear current.
				return false;
			}
		}

		const onAfter = ( _results ) => {
			// For data hooks.
			instance.onAfterApply( instance.args, _results );

			if ( instance.isDataChanged() ) {
				$e.internal( 'document/save/set-is-modified', { status: true } );
			}

			// For UI hooks.
			instance.onAfterRun( instance.args, _results );

			this.afterRun( command, args, results );
		};

		// TODO: Temp code determine if it's a jQuery deferred object.
		if ( results && 'object' === typeof results && results.promise && results.then && results.fail ) {
			results.fail( instance.onCatchApply.bind( instance ) );
			results.done( onAfter );
		} else if ( results instanceof Promise ) {
			results.catch( instance.onCatchApply.bind( instance ) );
			results.then( onAfter );
		} else {
			onAfter( results );
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
	 * @param {*} event
	 *
	 * @returns {boolean|*}
	 */
	runShortcut( command, event ) {
		return this.run( command, event );
	}

	/**
	 * Function afterRun().
	 *
	 * Method fired before the command runs.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} results
	 */
	afterRun( command, args, results ) {
		const component = this.getComponent( command ),
			container = component.getRootContainer();

		if ( args.onAfter ) {
			args.onAfter.apply( component, [ args, results ] );
		}

		this.currentTrace.pop();
		Commands.trace.pop();

		delete this.current[ container ];
		delete this.currentArgs[ container ];
	}

	validateInstance( instance, command ) {
		const component = this.getComponent( command );

		if ( ! instance || component !== instance.component ) {
			this.error( `invalid instance, command: '${ command }' ` );
		}
	}
	/**
	 * Function error().
	 *
	 * Throws error.
	 *
	 * @throw {Error}
	 *
	 * @param {string} message
	 */
	error( message ) {
		throw Error( `Commands: ${ message }` );
	}
}
