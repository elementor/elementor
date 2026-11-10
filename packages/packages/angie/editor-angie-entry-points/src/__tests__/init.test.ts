import { injectIntoControlHeader } from '@elementor/editor-controls';
import { injectIntoStyleTabHeader } from '@elementor/editor-editing-panel';

import { AngieControlHeaderAction } from '../control-header/angie-control-header-action';
import { init } from '../init';
import { AngieStyleTabHeaderAction } from '../style-section/angie-style-tab-header-action';

jest.mock( '@elementor/editor-controls', () => ( {
	injectIntoControlHeader: jest.fn(),
} ) );

jest.mock( '@elementor/editor-editing-panel', () => ( {
	injectIntoStyleTabHeader: jest.fn(),
} ) );

describe( 'init', () => {
	it( 'injects Angie actions into every entry point location', () => {
		// Act
		init();

		// Assert
		expect( injectIntoControlHeader ).toHaveBeenCalledWith( {
			id: 'angie-control-header-action',
			component: AngieControlHeaderAction,
		} );
		expect( injectIntoStyleTabHeader ).toHaveBeenCalledWith( {
			id: 'angie-style-tab-header-action',
			component: AngieStyleTabHeaderAction,
		} );
	} );
} );
