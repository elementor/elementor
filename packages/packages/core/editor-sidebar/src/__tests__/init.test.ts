import { injectIntoTop } from '@elementor/editor';

import { init } from '../init';

jest.mock( '@elementor/editor', () => ( {
	injectIntoTop: jest.fn(),
} ) );

describe( 'init', () => {
	it( 'injects the sidebar into the top location', () => {
		// Act.
		init();

		// Assert.
		expect( injectIntoTop ).toHaveBeenCalledWith( expect.objectContaining( { id: 'editor-sidebar' } ) );
	} );
} );
