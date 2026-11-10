import { injectIntoControlHeader } from '@elementor/editor-controls';

import { AngieControlHeaderAction } from '../control-header/angie-control-header-action';
import { init } from '../init';

jest.mock( '@elementor/editor-controls', () => ( {
	injectIntoControlHeader: jest.fn(),
} ) );

describe( 'init', () => {
	it( 'injects the Angie action into the control header', () => {
		// Act
		init();

		// Assert
		expect( injectIntoControlHeader ).toHaveBeenCalledWith( {
			id: 'angie-control-header-action',
			component: AngieControlHeaderAction,
		} );
	} );
} );
