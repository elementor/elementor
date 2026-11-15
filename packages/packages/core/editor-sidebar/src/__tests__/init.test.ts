import { injectIntoTop } from '@elementor/editor';

import { isSidebarEnabled } from '../gate';
import { init } from '../init';

jest.mock( '@elementor/editor', () => ( {
	injectIntoTop: jest.fn(),
} ) );

jest.mock( '../gate' );

describe( 'init', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'injects the sidebar into the top location when the sidebar is enabled', () => {
		// Arrange.
		jest.mocked( isSidebarEnabled ).mockReturnValue( true );

		// Act.
		init();

		// Assert.
		expect( injectIntoTop ).toHaveBeenCalledWith( expect.objectContaining( { id: 'editor-sidebar' } ) );
	} );

	it( 'does not inject the sidebar when the sidebar is disabled', () => {
		// Arrange.
		jest.mocked( isSidebarEnabled ).mockReturnValue( false );

		// Act.
		init();

		// Assert.
		expect( injectIntoTop ).not.toHaveBeenCalled();
	} );
} );
