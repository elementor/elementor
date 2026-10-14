import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { GLOBAL_STYLES_IMPORTED_EVENT } from '@elementor/editor-canvas';
import { act, waitFor } from '@testing-library/react';

import { loadDefaultStyles } from '../../load-default-styles';
import { GlobalStylesImportListener } from '../global-styles-import-listener';

jest.mock( '../../load-default-styles', () => ( {
	loadDefaultStyles: jest.fn().mockResolvedValue( undefined ),
} ) );

describe( '<GlobalStylesImportListener />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'reloads default styles after the global styles import event is dispatched', async () => {
		renderWithTheme( <GlobalStylesImportListener /> );

		act( () => {
			window.dispatchEvent( new CustomEvent( GLOBAL_STYLES_IMPORTED_EVENT ) );
		} );

		await waitFor( () => expect( loadDefaultStyles ).toHaveBeenCalledTimes( 1 ) );
	} );
} );
