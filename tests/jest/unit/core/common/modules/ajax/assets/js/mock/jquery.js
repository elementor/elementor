const createDeferred = () => {
	const deferred = {
		doneCallbacks: [],
		failCallbacks: [],
		alwaysCallbacks: [],
		state: 'pending',
		value: undefined,

		done( callback ) {
			if ( callback ) {
				if ( 'resolved' === deferred.state ) {
					callback( deferred.value );
				} else {
					deferred.doneCallbacks.push( callback );
				}
			}

			return deferred;
		},

		fail( callback ) {
			if ( callback ) {
				if ( 'rejected' === deferred.state ) {
					callback( deferred.value );
				} else {
					deferred.failCallbacks.push( callback );
				}
			}

			return deferred;
		},

		always( callback ) {
			if ( callback ) {
				if ( 'pending' !== deferred.state ) {
					callback( deferred.value );
				} else {
					deferred.alwaysCallbacks.push( callback );
				}
			}

			return deferred;
		},

		resolve( value ) {
			if ( 'pending' !== deferred.state ) {
				return deferred;
			}

			deferred.state = 'resolved';
			deferred.value = value;
			deferred.doneCallbacks.forEach( ( callback ) => callback( value ) );
			deferred.alwaysCallbacks.forEach( ( callback ) => callback( value ) );

			return deferred;
		},

		reject( value ) {
			if ( 'pending' !== deferred.state ) {
				return deferred;
			}

			deferred.state = 'rejected';
			deferred.value = value;
			deferred.failCallbacks.forEach( ( callback ) => callback( value ) );
			deferred.alwaysCallbacks.forEach( ( callback ) => callback( value ) );

			return deferred;
		},

		promise() {
			const promise = {
				done: ( callback ) => {
					deferred.done( callback );

					return promise;
				},

				fail: ( callback ) => {
					deferred.fail( callback );

					return promise;
				},

				always: ( callback ) => {
					deferred.always( callback );

					return promise;
				},

				state: () => deferred.state,

				promise: () => promise,

				then: ( onDone, onFail ) => {
					const next = createDeferred();

					deferred.done( ( value ) => next.resolve( onDone ? onDone( value ) : value ) );
					deferred.fail( ( value ) => next.reject( onFail ? onFail( value ) : value ) );

					return next.promise();
				},

				catch: ( onFail ) => promise.then( undefined, onFail ),
			};

			return promise;
		},
	};

	return deferred;
};

const each = ( object, callback ) => {
	Object.keys( object ).forEach( ( key ) => callback( key, object[ key ] ) );
};

const extend = ( ...args ) => {
	let deep = false;
	let targetIndex = 0;

	if ( 'boolean' === typeof args[ 0 ] ) {
		deep = args[ 0 ];
		targetIndex = 1;
	}

	const target = args[ targetIndex ] ?? {};
	const sources = args.slice( targetIndex + 1 );

	const merge = ( destination, source ) => {
		if ( ! source ) {
			return destination;
		}

		Object.keys( source ).forEach( ( key ) => {
			const sourceValue = source[ key ];
			const destinationValue = destination[ key ];

			if ( deep && sourceValue && 'object' === typeof sourceValue && ! Array.isArray( sourceValue ) ) {
				destination[ key ] = merge(
					destinationValue && 'object' === typeof destinationValue ? destinationValue : {},
					sourceValue,
				);
			} else {
				destination[ key ] = sourceValue;
			}
		} );

		return destination;
	};

	sources.forEach( ( source ) => merge( target, source ) );

	return target;
};

const when = ( ...deferreds ) => {
	const master = createDeferred();

	if ( ! deferreds.length ) {
		master.resolve();
		return master;
	}

	let remaining = deferreds.length;

	const checkDone = () => {
		remaining -= 1;

		if ( ! remaining ) {
			master.resolve();
		}
	};

	deferreds.forEach( ( deferred ) => {
		deferred.done( checkDone ).fail( () => master.reject() );
	} );

	return master;
};

const jQuery = Object.assign( jest.fn(), {
	Deferred: createDeferred,
	each,
	extend,
	when,
	ajax: jest.fn(),
} );

module.exports = jQuery;
