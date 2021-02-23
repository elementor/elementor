/**
 * @typedef HashCommand
 * @property {string} method,
 * @property {string} command
 * @property {function( ... )} callback
 */

export default class HashCommands {
	/**
	 * Cannot be static since its points on callback(s) that created only on creating of '$e'.
	 */
	hashFormat = {
		'e:run': $e.run,
		'e:route': $e.route,
	};

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
	 * @returns {Array.<HashCommand>}
	 */
	get( hash = location.hash ) {
		const result = [];

		if ( hash ) {
			// Remove first '#' and split each '&'.
			const hashList = hash.substr( 1 ).split( '&' );

			hashList.forEach( ( hashItem ) => {
				const hashParts = hashItem.split( ':' );

				if ( 3 === hashParts.length && this.hashFormat[ hashParts[ 0 ] + ':' + hashParts[ 1 ] ] ) {
					const method = hashParts[ 0 ] + ':' + hashParts[ 1 ],
						callback = this.hashFormat[ method ];

					if ( callback ) {
						const command = hashParts[ 2 ];

						result.push( {
							method,
							command,
							callback,
						} );
					}
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
	run( commands = this.commands ) {
		commands.forEach( ( command ) => {
			command.callback( command.command );
		} );
	}

	/**
	 * Function runOnce().
	 *
	 * Do same as `run` but clear `this.commands` before leaving.
	 */
	runOnce() {
		this.run( this.commands );

		this.commands = [];
	}
}
