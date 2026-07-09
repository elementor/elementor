import * as React from 'react';
import { renderWithStore } from 'test-utils';
import { GLOBAL_STYLES_IMPORTED_EVENT, type ImportedGlobalStylesPayload } from '@elementor/editor-canvas';
import { __createStore as createStore, __registerSlice as registerSlice } from '@elementor/store';
import { act } from '@testing-library/react';

import { loadCurrentDocumentClasses } from '../../load-document-classes';
import { slice } from '../../store';
import { trackGlobalClasses } from '../../utils/tracking';
import { GlobalStylesImportListener } from '../global-styles-import-listener';

jest.mock( '../../load-document-classes', () => ( {
	loadCurrentDocumentClasses: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackGlobalClasses: jest.fn().mockResolvedValue( undefined ),
} ) );

const dispatchImportedEvent = ( detail?: ImportedGlobalStylesPayload ) => {
	act( () => {
		window.dispatchEvent( new CustomEvent( GLOBAL_STYLES_IMPORTED_EVENT, { detail } ) );
	} );
};

describe( '<GlobalStylesImportListener />', () => {
	let store: ReturnType< typeof createStore >;

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( trackGlobalClasses ).mockResolvedValue( undefined );
		registerSlice( slice );
		store = createStore();
	} );

	it( 'refetch server initial data after import event is dispatched', () => {
		renderWithStore( <GlobalStylesImportListener />, store );

		dispatchImportedEvent();

		expect( loadCurrentDocumentClasses ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'tracks classCreated with source "imported" for each design-system imported class', async () => {
		renderWithStore( <GlobalStylesImportListener />, store );

		dispatchImportedEvent( { imported_class_ids: [ 'g-1', 'g-2' ] } );
		await Promise.resolve();

		expect( trackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classCreated',
			source: 'imported',
			classId: 'g-1',
		} );
		expect( trackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classCreated',
			source: 'imported',
			classId: 'g-2',
		} );
	} );

	it( 'tracks classCreated with source "imported" for each class imported via a template', async () => {
		renderWithStore( <GlobalStylesImportListener />, store );

		dispatchImportedEvent( {
			global_classes: {
				added_items: {
					'g-1': { id: 'g-1', type: 'class', label: 'my-class', variants: [] },
				},
				added_items_order: [ 'g-1' ],
			},
		} );
		await Promise.resolve();

		expect( trackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classCreated',
			source: 'imported',
			classId: 'g-1',
		} );
		expect( loadCurrentDocumentClasses ).not.toHaveBeenCalled();
	} );
} );
