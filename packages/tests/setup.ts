import { resetInjections } from '@elementor/locations';

import '@wordpress/jest-console';

beforeEach( () => {
	/* eslint-disable no-console */
	// The mocks already created at `@wordpress/jest-console`
	// here it just ensure that nothing will be prompt to the console.
	jest.mocked( console.error ).mockImplementation( () => {} );
	jest.mocked( console.warn ).mockImplementation( () => {} );
	jest.mocked( console.info ).mockImplementation( () => {} );
	/* eslint-enable no-console */

	resetInjections();
} );
