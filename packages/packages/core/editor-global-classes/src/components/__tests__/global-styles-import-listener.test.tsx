import * as React from 'react';
import { renderWithStore } from 'test-utils';
import { GLOBAL_STYLES_IMPORTED_EVENT } from '@elementor/editor-canvas';
import { __createStore as createStore, __registerSlice as registerSlice } from '@elementor/store';
import { act } from '@testing-library/react';

import { loadCurrentDocumentClasses } from '../../load-document-classes';
import { slice } from '../../store';
import { GlobalStylesImportListener } from '../global-styles-import-listener';

jest.mock( '../../load-document-classes', () => ( {
	loadCurrentDocumentClasses: jest.fn().mockResolvedValue( undefined ),
} ) );

describe( '<GlobalStylesImportListener />', () => {
	let store: ReturnType< typeof createStore >;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = createStore();
	} );

	it( 'refetch server initial data after import event is dispatched', () => {
		renderWithStore( <GlobalStylesImportListener />, store );

		act( () => {
			window.dispatchEvent( new CustomEvent( GLOBAL_STYLES_IMPORTED_EVENT ) );
		} );

		expect( loadCurrentDocumentClasses ).toHaveBeenCalledTimes( 1 );
	} );
} );
