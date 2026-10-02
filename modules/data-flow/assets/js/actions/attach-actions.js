import { toStoreResolver } from '../data-flow-store';
import { createInput } from './inputs';
import { createChannel } from './value-shaping';

export const LOAD_EVENT = 'load';
export const STATE_EVENT = 'state';
export const REDUCED_MOTION_RUN = 'run';

const ELEMENT_SELECTOR_ATTRIBUTE = 'data-interaction-id';

function logError( message, error ) {
	// eslint-disable-next-line no-console
	console.error( `[data-flow] ${ message }`, error ?? '' );
}

function round( value, decimals ) {
	if ( undefined === decimals || null === decimals ) {
		return value;
	}

	const factor = Math.pow( 10, decimals );

	return Math.round( value * factor ) / factor;
}

function attachEventAction( element, entry, store, registry ) {
	const run = ( extra ) => {
		const action = registry.get( entry.do );

		if ( ! action ) {
			logError( `Unknown action "${ entry.do }"` );
			return;
		}

		try {
			action( { args: entry.args ?? {}, element, store, ...extra } );
		} catch ( error ) {
			logError( `Action "${ entry.do }" failed`, error );
		}
	};

	if ( LOAD_EVENT === entry.on ) {
		run( {} );
		return () => {};
	}

	if ( STATE_EVENT === entry.on ) {
		run( { value: store.getState()[ entry.key ] } );

		return store.subscribe( entry.key, ( value ) => run( { value } ) );
	}

	const listener = ( event ) => run( { event } );

	element.addEventListener( entry.on, listener );

	return () => element.removeEventListener( entry.on, listener );
}

function attachInputAction( element, entry, store, env ) {
	if ( env.reducedMotion && REDUCED_MOTION_RUN !== entry.reducedMotion ) {
		return () => {};
	}

	const input = createInput( entry.input, element, entry, { ...env, wake: () => env.loop.wake() } );

	if ( ! input ) {
		logError( `Unknown input "${ entry.input }"` );
		return () => {};
	}

	const state = store.getState();
	const channels = Object.entries( entry.write ?? {} ).map( ( [ key, spec ] ) => ( {
		key,
		spec,
		channel: createChannel( spec, Number( state[ key ] ) || 0 ),
	} ) );

	const removeTask = env.loop.add( ( dt ) => {
		const { sample, changed } = input.read( dt );
		const partial = {};
		let moving = false;

		channels.forEach( ( { key, spec, channel } ) => {
			channel.setTarget( sample[ spec.from ] ?? 0 );

			if ( channel.step( dt ) ) {
				moving = true;
			}

			partial[ key ] = round( channel.value, spec.round );
		} );

		store.setState( partial );

		return changed || moving;
	} );

	return () => {
		removeTask();
		input.destroy();
	};
}

/**
 * @param {Array}                                       elementsActions [{ elementId, actions }] in the runtime shape.
 * @param {Object|Function}                             storeOrResolver A store, or a function resolving the store for an element.
 * @param {Document|Element}                            root
 * @param {{ registry, loop, win, doc, reducedMotion }} env
 */
export function attachActions( elementsActions, storeOrResolver, root, env ) {
	const resolveStore = toStoreResolver( storeOrResolver );
	const cleanups = [];

	elementsActions.forEach( ( { elementId, actions } ) => {
		root.querySelectorAll( `[${ ELEMENT_SELECTOR_ATTRIBUTE }="${ elementId }"]` ).forEach( ( element ) => {
			const store = resolveStore( element );

			actions.forEach( ( entry ) => {
				cleanups.push( entry.input
					? attachInputAction( element, entry, store, env )
					: attachEventAction( element, entry, store, env.registry ) );
			} );
		} );
	} );

	return () => cleanups.forEach( ( cleanup ) => cleanup() );
}
