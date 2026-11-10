import { injectIntoInlineEditingControlHeader, injectIntoInlineEditorToolbar } from '@elementor/editor-controls';

import { init } from '../init';
import { AngieTextAction } from '../text/angie-text-action';

jest.mock( '@elementor/editor-controls', () => ( {
	injectIntoInlineEditingControlHeader: jest.fn(),
	injectIntoInlineEditorToolbar: jest.fn(),
} ) );

describe( 'init', () => {
	it( 'injects the Angie text action into the inline editor toolbar and the panel text control header', () => {
		// Act
		init();

		// Assert
		expect( injectIntoInlineEditorToolbar ).toHaveBeenCalledWith( {
			id: 'angie-text-action',
			component: AngieTextAction,
		} );
		expect( injectIntoInlineEditingControlHeader ).toHaveBeenCalledWith( {
			id: 'angie-text-action',
			component: AngieTextAction,
		} );
	} );
} );
