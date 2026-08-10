import { injectIntoTop } from '@elementor/editor';

jest.mock( '@elementor/editor', () => ( {
	injectIntoTop: jest.fn(),
} ) );

import { init } from '../init';

describe( 'init', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'injects the site settings tab host into the editor shell', () => {
		// Act.
		init();

		// Assert.
		expect( injectIntoTop ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: 'editor-site-settings-tab',
			} )
		);
	} );
} );
