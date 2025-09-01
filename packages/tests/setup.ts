// Add JSDOM matchers.
import '@testing-library/jest-dom';
import '@wordpress/jest-console';

import {
	__privateFlushListeners as flushListeners,
	__privateSetReady as setReady,
} from '@elementor/editor-v1-adapters';
import { __resetEnv } from '@elementor/env';
import { __flushAllInjections } from '@elementor/locations';
import { __deleteStore } from '@elementor/store';

jest.mock( '@elementor/http-client' );

globalThis.structuredClone = ( value ) => JSON.parse( JSON.stringify( value ) );

globalThis.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

let globalOriginalProps: PropertyKey[];

beforeEach( () => {
	/* eslint-disable no-console */
	// The mocks already created at `@wordpress/jest-console`
	// here it just ensure that nothing will be prompt to the console.
	jest.mocked( console.error ).mockImplementation( () => null );
	jest.mocked( console.warn ).mockImplementation( () => null );
	jest.mocked( console.info ).mockImplementation( () => null );
	/* eslint-enable no-console */

	setReady( true );

	globalOriginalProps = Object.keys( globalThis );
} );

afterEach( () => {
	jest.clearAllMocks();
	jest.useRealTimers();

	__flushAllInjections();
	flushListeners();
	__deleteStore();
	__resetEnv();

	// Delete all the props that were added to the global.
	Object.keys( globalThis ).forEach( ( key ) => {
		if ( ! globalOriginalProps.includes( key ) ) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete ( globalThis as unknown as Record< PropertyKey, unknown > )[ key ];
		}
	} );
} );
