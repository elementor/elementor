import { flushInjections } from '@elementor/locations';
import { flushListeners, setReady } from '@elementor/v1-adapters';
import { deleteStore } from '@elementor/store';

// Add JSDOM matchers.
import '@testing-library/jest-dom';
import '@wordpress/jest-console';

let windowOriginalProps: PropertyKey[];

beforeEach( () => {
	/* eslint-disable no-console */
	// The mocks already created at `@wordpress/jest-console`
	// here it just ensure that nothing will be prompt to the console.
	jest.mocked( console.error ).mockImplementation( () => null );
	jest.mocked( console.warn ).mockImplementation( () => null );
	jest.mocked( console.info ).mockImplementation( () => null );
	/* eslint-enable no-console */

	setReady( true );

	windowOriginalProps = Object.keys( window );
} );

afterEach( () => {
	jest.clearAllMocks();

	flushInjections();
	flushListeners();
	deleteStore();

	// Delete all the props that were added to the window.
	Object.keys( window ).forEach( ( key ) => {
		if ( ! windowOriginalProps.includes( key ) ) {
			delete ( window as unknown as Record<PropertyKey, unknown> )[ key ];
		}
	} );
} );
