import { toStoreResolver } from './data-flow-store';

export const INIT_EVENT = 'init';

const ELEMENT_SELECTOR_ATTRIBUTE = 'data-interaction-id';

function compileHandler( code, elementId ) {
	try {
		// Handlers are trusted, user-authored plain JavaScript; saving them requires the `unfiltered_html` capability.
		// eslint-disable-next-line no-new-func
		return new Function( 'context', `const { element, event, state, getState, setState, subscribe } = context;\n${ code }` );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( `[data-flow] Invalid handler on element "${ elementId }"`, error );
		return null;
	}
}

function createContext( element, event, store ) {
	return {
		element,
		event,
		get state() {
			return store.getState();
		},
		getState: store.getState,
		setState: store.setState,
		subscribe: store.subscribe,
	};
}

function attachElementHandlers( element, elementId, handlers, store ) {
	handlers.forEach( ( { event, code } ) => {
		const handler = compileHandler( code, elementId );

		if ( ! handler ) {
			return;
		}

		const invoke = ( domEvent ) => {
			try {
				handler( createContext( element, domEvent, store ) );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( `[data-flow] Handler "${ event }" failed on element "${ elementId }"`, error );
			}
		};

		if ( INIT_EVENT === event ) {
			invoke( null );
			return;
		}

		element.addEventListener( event, invoke );
	} );
}

export function attachHandlers( elementsHandlers, storeOrResolver, root ) {
	const resolveStore = toStoreResolver( storeOrResolver );

	elementsHandlers.forEach( ( { elementId, handlers } ) => {
		root.querySelectorAll( `[${ ELEMENT_SELECTOR_ATTRIBUTE }="${ elementId }"]` ).forEach( ( element ) => {
			attachElementHandlers( element, elementId, handlers, resolveStore( element ) );
		} );
	} );
}
