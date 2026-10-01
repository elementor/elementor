import { bindTextNodes } from './data-flow-bindings';
import { attachHandlers } from './data-flow-handlers';
import { createStore } from './data-flow-store';

export const DATA_SCRIPT_ID = 'elementor-data-flow-data';

function readData( doc ) {
	const dataScript = doc.getElementById( DATA_SCRIPT_ID );

	if ( ! dataScript ) {
		return null;
	}

	try {
		return JSON.parse( dataScript.textContent );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[data-flow] Invalid data', error );
		return null;
	}
}

export function initDataFlow( doc ) {
	const data = readData( doc );

	if ( ! data ) {
		return null;
	}

	const store = createStore( data.state || {} );

	bindTextNodes( doc.body, store, data.bindings || [] );
	attachHandlers( data.handlers || [], store, doc );

	return store;
}
