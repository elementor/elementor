import { renderHook } from '@testing-library/react';

import useOpenDocumentInNewTab from '../use-open-document-in-new-tab';

jest.mock( '../utils', () => ( {
	getUpdateUrl: ( id: number ) => new URL( `https://example.com/?post=${ id }` ),
} ) );

describe( 'useOpenDocumentInNewTab', () => {
	beforeEach( () => {
		jest.spyOn( window, 'open' ).mockImplementation( () => null );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'should open a new tab with the correct URL', () => {
		const { result } = renderHook( () => useOpenDocumentInNewTab() );

		result.current( 456 );

		expect( window.open ).toHaveBeenCalledWith( 'https://example.com/?post=456' );
	} );
} );
