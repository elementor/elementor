import { injectIntoInlineEditorToolbar } from '@elementor/editor-controls';

import { init } from '../init';
import { AngieTextAction } from '../text/angie-text-action';

jest.mock( '@elementor/editor-controls', () => ( {
	injectIntoInlineEditorToolbar: jest.fn(),
} ) );

describe( 'init', () => {
	it( 'injects the Angie text action into the inline editor toolbar', () => {
		// Act
		init();

		// Assert
		expect( injectIntoInlineEditorToolbar ).toHaveBeenCalledWith( {
			id: 'angie-text-action',
			component: AngieTextAction,
		} );
	} );
} );
