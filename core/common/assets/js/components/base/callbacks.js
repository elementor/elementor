export default class Callbacks extends elementorModules.Module {
	/**
	 * Function constructor().
	 *
	 * Create Callbacks base.
	 *
	 * @param {{}} args
	 */
	constructor( ...args ) {
		super( ...args );

		/**
		 * Current command.
		 *
		 * @type {string}
		 */
		this.current = '';

		/**
		 * Array of ids which in use.
		 *
		 * @type {Array}
		 */
		this.usedIds = [];

		/**
		 * Object of callbacks.
		 *
		 * TODO: Create full jsdoc of the object.
		 *
		 * @type {{}}
		 */
		this.callbacks = { after: {} };

		/**
		 * Object of depth.
		 *
		 * @type {{}}
		 */
		this.depth = { after: {} };
	}

	/**
	 * Function getType().
	 *
	 * Returns type eg: ( event, hook, etc ... ).
	 *
	 * @returns {string} type
	 */
	getType() {
		elementorModules.forceMethodImplementation();
	}

	/**
	 * Function getAll().
	 *
	 * Return all possible callbacks.
	 *
	 * @returns {{}}
	 */
	getAll() {
		const result = {};

		Object.keys( this.callbacks ).forEach( ( event ) => {
			if ( ! result[ event ] ) {
				result[ event ] = [];
			}

			Object.keys( this.callbacks[ event ] ).forEach( ( command ) => {
				result[ event ].push( {
					command,
					callbacks: this.callbacks[ event ][ command ],
				} );
			} );
		} );

		return result;
	}

	/**
	 * Function getCurrent();
	 *
	 * Return current command.
	 *
	 * @returns {string}
	 */
	getCurrent() {
		return this.current;
	}

	/**
	 * Function getUsedIds().
	 *
	 * Returns the current used ids.
	 *
	 * @returns {Array}
	 */
	getUsedIds() {
		return this.usedIds;
	}

	/**
	 * Function getCallbacks().
	 *
	 * Get available callbacks for specific event and command.
	 *
	 * @param {string} event
	 * @param {string} command
	 *
	 * @returns {array} callbacks
	 */
	getCallbacks( event, command ) {
		for ( const _command in this.callbacks[ event ] ) {
			// In case of multi command hooking.
			if ( _command.includes( ',' ) ) {
				if ( _command.split( ',' ).some( ( _multiCommand ) => _multiCommand === command ) ) {
					return this.callbacks[ event ][ _command ];
				}
			}
		}

		return this.callbacks[ event ][ command ];
	}

	/**
	 * function checkEvent().
	 *
	 * Validate if the event is available.
	 *
	 * @param {string} event
	 */
	checkEvent( event ) {
		if ( -1 === Object.keys( this.callbacks ).indexOf( event ) ) {
			throw Error( `${ this.getType() }: '${ event }' is not available.` );
		}
	}

	/**
	 * Function checkInstance().
	 *
	 * Validate given instance.
	 *
	 * @param {CallbackBase} instance
	 */
	checkInstance( instance ) {
		if ( instance.getType() !== this.getType() ) {
			throw new Error( `invalid instance, please use: 'elementor-document/callback/base/base'. ` );
		}
	}

	/**
	 * Function checkId().
	 *
	 * Validate if the id is not used before.
	 *
	 * @param {string} id
	 */
	checkId( id ) {
		if ( -1 !== this.usedIds.indexOf( id ) ) {
			throw Error( `id: '${ id }' is already in use.` );
		}
	}

	/**
	 * Function register().
	 *
	 * Register the callback instance.
	 *
	 * @param {string} event
	 * @param {CallbackBase} instance
	 *
	 * @returns {{}} Current callback
	 */
	register( event, instance ) {
		const command = instance.getCommand(),
			id = instance.getId();

		this.checkEvent( event );
		this.checkInstance( instance );
		this.checkId( id );

		if ( ! this.callbacks[ event ][ command ] ) {
			this.callbacks[ event ][ command ] = [];
		}

		// Save used id(s).
		this.usedIds.push( id );

		return this.callbacks[ event ][ command ].push( {
			id,
			callback: instance.run.bind( instance ),
		} );
	}

	/**
	 * Function run().
	 *
	 * Run the callbacks.
	 *
	 * @param {string} event
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} result
	 */
	run( event, command, args, result = undefined ) {
		const callbacks = this.getCallbacks( event, command );

		if ( this.shouldRun( callbacks ) ) {
			this.current = command;

			this.onRun( command, args, event );

			this.runCallbacks( event, command, callbacks, args, result );
		}
	}

	/**
	 * Function runCallbacks().
	 *
	 * Run's the given callbacks.
	 *
	 * @param {string} event
	 * @param {string} command
	 * @param {array} callbacks
	 * @param {{}} args
	 * @param {*} result
	 */
	runCallbacks( event, command, callbacks, args, result ) {
		for ( const i in callbacks ) {
			const callback = callbacks[ i ];

			// If not exist, set zero.
			if ( undefined === this.depth[ event ][ callback.id ] ) {
				this.depth[ event ][ callback.id ] = 0;
			}

			this.depth[ event ][ callback.id ]++;

			// Prevent recursive hooks.
			if ( 1 === this.depth[ event ][ callback.id ] ) {
				this.onCallback( command, args, event, callback.id );

				if ( ! this.runCallback( event, callback, args, result ) ) {
					throw Error( `Callback failed, event: '${ event }'` );
				}
			}

			this.depth[ event ][ callback.id ]--;
		}
	}

	/**
	 * Function runCallback().
	 *
	 * Run's the given callback.
	 *
	 * @param {string} event
	 * @param {{}} callback
	 * @param {{}} args
	 * @param {*} result
	 *
	 * @returns {boolean}
	 *
	 * @throw {Error}
	 */
	runCallback( event, callback, args, result ) {
		elementorModules.forceMethodImplementation();
	}

	/**
	 * Function shouldRun().
	 *
	 * Determine if the event should run.
	 *
	 * @param {array} callbacks
	 *
	 * @throw {Error}
	 */
	shouldRun( callbacks ) {
		elementorModules.forceMethodImplementation();
	}

	/**
	 * Function onRun().
	 *
	 * Called before run a set of callbacks.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {string} event
	 *
	 * @throw {Error}
	 */
	onRun( command, args, event ) {
		elementorModules.forceMethodImplementation();
	}

	/**
	 * Function onCallback().
	 *
	 * Called before a single callback.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {string} event
	 * @param {string} id
	 *
	 * @throw {Error}
	 */
	onCallback( command, args, event, id ) {
		elementorModules.forceMethodImplementation();
	}
}
