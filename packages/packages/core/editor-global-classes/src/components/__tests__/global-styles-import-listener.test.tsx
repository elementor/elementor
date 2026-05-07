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

	it( 'merges classes when payload is provided and does not trigger a server reload', () => {
		renderWithStore( <GlobalStylesImportListener />, store );

		const items = {
			'class-1': { id: 'class-1', label: 'Class 1', type: 'class', variants: [] },
		};

		act( () => {
			window.dispatchEvent(
				new CustomEvent( GLOBAL_STYLES_IMPORTED_EVENT, {
					detail: { global_classes: { items, order: [ 'class-1' ] } },
				} )
			);
		} );

		expect( loadCurrentDocumentClasses ).not.toHaveBeenCalled();
	} );

	it( 'falls back to a full server reload when the event has no payload', () => {
		renderWithStore( <GlobalStylesImportListener />, store );

		act( () => {
			window.dispatchEvent( new CustomEvent( GLOBAL_STYLES_IMPORTED_EVENT ) );
		} );

		expect( loadCurrentDocumentClasses ).toHaveBeenCalledTimes( 1 );
	} );
} );
