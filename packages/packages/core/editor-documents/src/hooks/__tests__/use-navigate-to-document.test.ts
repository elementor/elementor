import { renderHook } from '@testing-library/react';

import { switchToDocument } from '../../sync/utils';
import { useNavigateToDocument } from '../index';

jest.mock( '../../sync/utils' );

describe( '@elementor/editor-documents - useNavigateToDocument', () => {
	const originalReplaceState = history.replaceState;
	const originalLocation = window.location;

	beforeEach( () => {
		jest.resetAllMocks();

		history.replaceState = jest.fn();

		/**
		 * @see https://gist.github.com/the0neWhoKnocks/bdac1d09b93b8418d948558f7ab233d7#setting-props-on-windowlocation
		 */
		Object.defineProperty( window, 'location', {
			writable: true,
			value: new URL( 'https://localhost/' ),
		} );
	} );

	afterAll( () => {
		history.replaceState = originalReplaceState;

		Object.defineProperty( window, 'location', {
			writable: false,
			value: originalLocation,
		} );
	} );

	it( 'should navigate to document and change query params', async () => {
		// Arrange.
		// TS doesn't allow modifying the location object.
		( window as unknown as { location: URL } ).location = new URL( 'https://localhost/?post=1&active-document=3' );

		const { result } = renderHook( useNavigateToDocument );

		const navigateToDocument = result.current;

		// Act.
		await navigateToDocument( 123 );

		// Assert.
		expect( switchToDocument ).toHaveBeenNthCalledWith( 1, 123, { setAsInitial: true } );

		expect( history.replaceState ).toHaveBeenCalledTimes( 1 );
		expect( history.replaceState ).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			expect.objectContaining( { href: 'https://localhost/?post=123' } )
		);
	} );
} );
