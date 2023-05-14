import CommandsBackwardsCompatibility from './backwards-compatibility/commands';
import CommandBase from '../modules/command-base';
import Console from 'elementor-api/utils/console';
import Deprecation from 'elementor-api/utils/deprecation';

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
	static trace = [];

	/**
	 * Function constructor().
	 *
	 * Create `$e.commands` API.
	 *
	 * @param {{}} args
	 */
	constructor( ... args ) {
		super( ... args );

		this.current = {};
		this.currentArgs = {};
		this.currentTrace = [];
		this.commands = {};
		this.components = {};

		Object.defineProperty( this, 'classes', {
			get() {
				Deprecation.deprecated(
					'$e.commands.classes',
					'3.7.0',
					'$e.commands.getCommandClass(), $e.commandsInternal.getCommandClass(), $e.data.getCommandClass(), $e.routes.getCommandClass() according to the requested command infra-structure,',
				);

				return {
					... $e.commands.commands,
					... $e.commandsInternal.commands,
					... $e.data.commands,
					... $e.routes.commands,
				};
			},
		} );
	}

	/**
	 * @param {string} id
	 * @return {CommandBase} command class
	 */
	getCommandClass( id ) {
		return this.commands[ id ];
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

		return command === this.current[ component.getServiceName() ];
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
	 * Responsible to add current command to trace and trigger 'run:before' event.
	 * Run before command.
	 *
	 * @param {string}  command
	 * @param {{}}      args
	 * @param {boolean} [addTrace=true]
	 */
	beforeRun( command, args = {}, addTrace = true ) {
		const component = this.getComponent( command ),
			container = component.getServiceName();

		if ( addTrace ) {
			this.addCurrentTrace( container, command, args );
		}

		if ( args.onBefore ) {
			args.onBefore.apply( component, [ args ] );
		}

		this.trigger( 'run:before', component, command, args );

		window.dispatchEvent( new CustomEvent( 'elementor/commands/run/before', {
			detail: {
				command,
				args,
			},
		} ) );
	}

	/**
	 * Function validateRun().
	 *
	 * Responsible to validate if the run is even possible.
	 * Runs immediately after entering `run()`.
	 *
	 * @param {string} command
	 * @param {*}      args
	 *
	 * @return {boolean} dependency result
	 */
	validateRun( command, args = {} ) {
		if ( ! this.commands[ command ] ) {
			this.error( `\`${ command }\` not found.` );
		}

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
		if ( ! this.validateRun( command, args ) ) {
			return false;
		}

		this.beforeRun( command, args );

		// Get command class or callback.
		let context = this.commands[ command ];

		// Is it command-base based class?
		if ( context.getInstanceType ) {
			context = new context( args );
		}

		const currentComponent = this.getComponent( command );

		// Is simple callback? (e.g.  a route)
		if ( ! ( context instanceof CommandBase ) ) {
			const results = context.apply( currentComponent, [ args ] );

			this.afterRun( command, args, results );

			return results;
		}

		if ( ! this.validateInstanceScope( context, currentComponent, command ) ) {
			return this.removeCurrentTrace( currentComponent );
		}

		return this.runInstance( context );
	}

	/**
	 * Function runInstance().
	 *
	 * @param {CommandBase} instance
	 *
	 * @return {boolean|Promise<*>}
	 */
	runInstance( instance ) {
		let results = null;

		// For UI Hooks.
		instance.onBeforeRun( instance.args );

		try {
			// For data hooks.
			instance.onBeforeApply( instance.args );

			results = instance.run();
		} catch ( e ) {
			this.catchApply( e, instance );

			if ( e instanceof $e.modules.HookBreak ) {
				this.removeCurrentTrace( instance.component );
				return false;
			}
		}

		return this.applyRunAfter( instance, results );
	}

	/**
	 * Function applyRunAfter().
	 *
	 * Responsible for applying everything that need to be run after each command runs.
	 * Called on run() after runInstance(), to manipulate results & apply 'after' hooks.
	 *
	 * @param {CommandBase} instance
	 * @param {*}           result
	 *
	 * @return {Promise<*>|*}
	 */
	applyRunAfter( instance, result ) {
		// TODO: Temp code determine if it's a jQuery deferred object.
		if ( result && 'object' === typeof result && result.promise && result.then && result.fail ) {
			const handleJQueryDeferred = ( _result ) => {
				_result.fail( ( e ) => {
					this.catchApply( e, instance );
					this.afterRun( instance.command, instance.args, e );
				} );
				_result.done( ( __result ) => {
					this.applyRunAfterSync( instance, __result );
				} );

				return _result;
			};

			return handleJQueryDeferred( result );
		} else if ( result instanceof Promise ) {
			return this.applyRunAfterAsync( instance, result );
		}

		this.applyRunAfterSync( instance, result );

		return result;
	}

	/**
	 * Function applyRunAfterSync().
	 *
	 * Responsible to handle simple(synchronous) 'run after' behavior.
	 * Called on applyRunAfterSync() after runInstance(), to handle results.
	 *
	 * @param {CommandBase} instance
	 * @param {*}           result
	 */
	applyRunAfterSync( instance, result ) {
		// Run Data hooks.
		instance.onAfterApply( instance.args, result );

		// For UI hooks.
		instance.onAfterRun( instance.args, result );

		this.afterRun( instance.command, instance.args, result );
	}

	/**
	 * Function applyRunAfterAsync().
	 *
	 * Await for promise result.
	 * Called on applyRunAfter() after runInstance().
	 *
	 * @param {CommandBase} instance
	 * @param {*}           result
	 */
	applyRunAfterAsync( instance, result ) {
		// Override initial result ( promise ) to await onAfter promises, first!.
		return ( async () => {
			await result.catch( ( e ) => {
				this.catchApply( e, instance );
				this.afterRun( instance.command, instance.args, e );
			} );
			await result.then( ( _result ) => this.applyRunAfterAsyncResult( instance, _result ) );

			return result;
		} )();
	}

	/**
	 * Function applyRunAfterAsyncResult().
	 *
	 * Responsible to await all promises results.
	 * Called on applyRunAfterAsync() after runInstance(), to handle async results.
	 * Awaits all the promises, before releasing the command.
	 *
	 * @param {CommandBase} instance
	 * @param {*}           result
	 */
	async applyRunAfterAsyncResult( instance, result ) {
		// Run Data hooks.
		const results = instance.onAfterApply( instance.args, result ),
			promises = Array.isArray( results ) ? results.flat().filter( ( filtered ) => filtered instanceof Promise ) : [];

		if ( promises.length ) {
			// Wait for hooks before return the value.
			await Promise.all( promises );
		}

		// For UI hooks.
		instance.onAfterRun( instance.args, result );

		this.afterRun( instance.command, instance.args, result );
	}

	/**
	 * Function afterRun().
	 *
	 * Responsible to to clear command from trace, and run 'run:after' event.
	 * Method fired after the command runs.
	 *
	 * @param {string}  command
	 * @param {{}}      args
	 * @param {*}       results
	 * @param {boolean} [removeTrace=true]
	 */
	afterRun( command, args, results = undefined, removeTrace = true ) {
		const component = this.getComponent( command );

		if ( args.onAfter ) {
			args.onAfter.apply( component, [ args, results ] );
		}

		this.trigger( 'run:after', component, command, args, results );

		window.dispatchEvent( new CustomEvent( 'elementor/commands/run/after', {
			detail: {
				command,
				args,
			},
		} ) );

		if ( removeTrace ) {
			this.removeCurrentTrace( component );
		}
	}

	/**
	 * @param {Error}       e
	 * @param {CommandBase} instance
	 */
	catchApply( e, instance ) {
		instance.onCatchApply( e );

		Console.error( e );
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

	validateInstanceScope( instance, currentComponent, command ) {
		if ( ! ( instance instanceof CommandBase ) ) {
			this.error( `invalid instance, command: '${ command }' ` );
		}

		// In case of different scope.
		if ( currentComponent !== instance.component ) {
			if ( $e.devTools ) {
				$e.devTools.log.warn( `Command: '${ command }' registerArgs.component: '${ instance.component.getNamespace() }' while current component is: '${ currentComponent.getNamespace() }'` );
			}

			return false;
		}

		return true;
	}

	addCurrentTrace( container, command, args ) {
		this.currentTrace.push( command );

		Commands.trace.push( command );

		this.attachCurrent( container, command, args );
	}

	removeCurrentTrace( currentComponent ) {
		const container = currentComponent.getServiceName();

		this.currentTrace.pop();

		Commands.trace.pop();

		this.detachCurrent( container );
	}

	attachCurrent( container, command, args ) {
		this.current[ container ] = command;
		this.currentArgs[ container ] = args;
	}

	detachCurrent( container ) {
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
