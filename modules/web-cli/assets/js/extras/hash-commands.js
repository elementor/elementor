import Console from 'elementor-api/utils/console';

export default class HashCommands {
	/**
	 * Cannot be static since it uses callback(s) that are available only after '$e' is initialized.
	 */
	dispatchersList = {
		'e:run': {
			runner: () => $e.run,
			isSafe: ( command ) => $e.commands.getCommandClass( command )?.getInfo().isSafe,
			isSafeWithArgs: ( command ) => $e.commands.getCommandClass( command )?.getInfo().isSafeWithArgs,
		},

		'e:route': {
			runner: () => $e.route,
			isSafe: () => true,
			isSafeWithArgs: () => false,
		},
	};

	/**
	 * @typedef HashCommand
	 * @property {string} method  method
	 * @property {string} command command
	 * @property {Object} args    arguments
	 */
	/**
	 * List of current loaded hash commands.
	 *
	 * @type {Array.<HashCommand>}
	 */
	commands = [];

	constructor() {
		this.commands = this.get();
	}

	/**
	 * Function get().
	 *
	 * Get API requests that comes from hash ( eg #e:run ).
	 *
	 * @param {string} hash
	 *
	 * @return {Array.<HashCommand>} API requests
	 */
	get( hash = location.hash ) {
		const result = [];

		if ( hash ) {
			// Remove first '#' and split each '&'.
			const hashList = hash.substr( 1 ).split( '&' );

			hashList.forEach( ( hashItem ) => {
				// eslint-disable-next-line @wordpress/no-unused-vars-before-return
				const [ rawCommand, rawArgs ] = hashItem.split( '?' );

				const hashParts = rawCommand.split( ':' );

				if ( 3 !== hashParts.length ) {
					return;
				}

				const method = hashParts[ 0 ] + ':' + hashParts[ 1 ],
					dispatcher = this.dispatchersList[ method ];

				if ( dispatcher ) {
					const command = hashParts[ 2 ],
						args = this.parseCommandArgs( rawArgs );

					result.push( {
						method,
						command,
						args,
					} );
				}
			} );
		}

		return result;
	}

	/**
	 * Function run().
	 *
	 * Run API requests that comes from hash ( eg #e:run ).
	 *
	 * @param {Array.<HashCommand>} [commands=this.commands]
	 */
	async run( commands = this.commands ) {
		// To allow validate the run first.
		for ( const hashCommand of commands ) {
			const dispatcher = this.dispatchersList[ hashCommand.method ];

			if ( ! dispatcher ) {
				return Promise.reject( new Error( `No dispatcher found for the command: \`${ hashCommand.command }\`.` ) );
			}

			if ( ! dispatcher.isSafe( hashCommand.command ) ) {
				return Promise.reject( new Error( `Attempting to run unsafe or non exist command: \`${ hashCommand.command }\`.` ) );
			}
		}

		// This logic will run the promises by sequence (will wait for dispatcher to finish, before run again).
		for ( const hashCommand of commands ) {
			const dispatcher = this.dispatchersList[ hashCommand.method ];

			await dispatcher.runner()(
				hashCommand.command,
				dispatcher.isSafeWithArgs( hashCommand.command ) ? hashCommand.args : undefined,
			);
		}
	}

	/**
	 * Function runOnce().
	 *
	 * Do same as `run` but clear `this.commands` before leaving.
	 */
	runOnce() {
		this.run( this.commands ).then( () => {
			this.commands = [];
		} );
	}

	/**
	 * Takes a args in form of JSON and parse it.
	 *
	 * @param {string} rawArgs
	 * @return {Object} args in as an object
	 */
	parseCommandArgs( rawArgs ) {
		try {
			return JSON.parse(
				decodeURI( rawArgs || '{}' ),
			);
		} catch ( e ) {
			Console.warn( 'Hash commands JSON args cannot be parsed. \n\n', e );

			return {};
		}
	}
}
