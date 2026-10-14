import { createStateProxy, getWriteBatcher } from './data-flow-write-batcher';
import { toStoreResolver } from './data-flow-store';

const ELEMENT_SELECTOR_ATTRIBUTE = 'data-interaction-id';
const FULL_TURN_DEGREES = 360;
const HALF_TURN_DEGREES = 180;
const EMIT_EVENT_PREFIX = 'e-state:';
const INIT_EVENT = 'init';

function toLocalPosition( element, domEvent ) {
	const rect = element.getBoundingClientRect();
	const x = ( domEvent?.clientX ?? 0 ) - rect.left;
	const y = ( domEvent?.clientY ?? 0 ) - rect.top;
	const fromCenterX = x - ( rect.width / 2 );
	const fromCenterY = y - ( rect.height / 2 );
	const angle = ( ( ( Math.atan2( fromCenterX, -fromCenterY ) * HALF_TURN_DEGREES ) / Math.PI ) + FULL_TURN_DEGREES ) % FULL_TURN_DEGREES;

	return { x, y, angle, size: { width: rect.width, height: rect.height } };
}

function readValue( target ) {
	if ( 'checkbox' === target?.type ) {
		return target.checked;
	}

	return target && 'value' in target ? target.value : undefined;
}

function createEventApi( element, domEvent ) {
	return {
		value: readValue( domEvent?.target ),
		key: domEvent?.key,
		local: toLocalPosition( element, domEvent ),
		preventDefault: () => domEvent?.preventDefault(),
	};
}

function createContext( { element, domEvent, store, pageStore } ) {
	return {
		state: createStateProxy( getWriteBatcher( store ) ),
		page: createStateProxy( getWriteBatcher( pageStore ) ),
		event: createEventApi( element, domEvent ),
		emit: ( name, detail ) => element.dispatchEvent( new CustomEvent( `${ EMIT_EVENT_PREFIX }${ name }`, { bubbles: true, detail } ) ),
	};
}

function attachReference( { element, reference, handler, resolveStore, pageStore, warnAboveMs } ) {
	const invoke = ( domEvent ) => {
		const startedAt = performance.now();

		try {
			handler( createContext( { element, domEvent, store: resolveStore( element ), pageStore } ) );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( `[data-flow] Snippet "${ reference.snippet }" failed on "${ reference.event }"`, error );
		}

		const duration = performance.now() - startedAt;

		if ( warnAboveMs && duration > warnAboveMs ) {
			// eslint-disable-next-line no-console
			console.warn( `[data-flow] Snippet "${ reference.snippet }" took ${ duration.toFixed( 1 ) }ms on "${ reference.event }".` );
		}
	};

	if ( INIT_EVENT === reference.event ) {
		invoke( null );

		return;
	}

	element.addEventListener( reference.event, invoke );
}

export function attachSnippets( { entries, registry, storeOrResolver, pageStore, root, selectorAttribute = ELEMENT_SELECTOR_ATTRIBUTE, warnAboveMs } ) {
	const resolveStore = toStoreResolver( storeOrResolver );
	const attached = new WeakMap();

	const attachPending = () => {
		const currentEntries = 'function' === typeof entries ? entries() : entries;

		currentEntries.forEach( ( { elementId, snippets } ) => {
			root.querySelectorAll( `[${ selectorAttribute }="${ elementId }"]` ).forEach( ( element ) => {
				const done = attached.get( element ) ?? new Set();

				attached.set( element, done );

				snippets.forEach( ( reference ) => {
					const handler = registry.getHandler( reference.snippet, reference.event );
					const id = `${ reference.snippet }:${ reference.event }`;

					if ( handler && ! done.has( id ) ) {
						done.add( id );
						attachReference( { element, reference, handler, resolveStore, pageStore, warnAboveMs } );
					}
				} );
			} );
		} );
	};

	attachPending();

	return { attachPending, stop: registry.onRegister?.( attachPending ) };
}
