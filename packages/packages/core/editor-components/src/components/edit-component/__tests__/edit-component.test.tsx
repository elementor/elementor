import * as React from 'react';
import { createDOMElement, createMockDocument, renderWithStore } from 'test-utils';
import { getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { __privateListenTo, __privateRunCommand } from '@elementor/editor-v1-adapters';
import { __createStore, __registerSlice as registerSlice, type SliceState, type Store } from '@elementor/store';
import { act, fireEvent, screen } from '@testing-library/react';

import { apiClient } from '../../../api';
import { selectLoadIsPending, slice } from '../../../store/store';
import { COMPONENT_DOCUMENT_TYPE } from '../../consts';
import { EditComponent } from '../edit-component';

jest.mock( '../component-modal', () => ( {
	ComponentModal: ( { onClose }: { onClose: () => void } ) =>
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		( <div aria-label="mock-backdrop" onClick={ onClose }></div> ) as unknown as React.ComponentType< {
			onClose: () => void;
		} >,
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRunCommand: jest.fn(),
	__privateListenTo: jest.fn(),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	...jest.requireActual( '@elementor/editor-documents' ),
	getV1DocumentsManager: jest.fn(),
} ) );

jest.mock( '../../../store/store', () => ( {
	...jest.requireActual( '../../../store/store' ),
	selectComponentsObject: jest.fn(),
	selectLoadIsPending: jest.fn(),
} ) );

jest.mock( '../../../api' );

const MOCK_DOCUMENT_ID = 1;
const MOCK_COMPONENT_ID = 123;
const MOCK_NESTED_COMPONENT_ID = 456;

const MOCK_POST_DATA = {
	[ MOCK_DOCUMENT_ID ]: mockDocument( MOCK_DOCUMENT_ID ),
	[ MOCK_COMPONENT_ID ]: mockDocument( MOCK_COMPONENT_ID, true ),
	[ MOCK_NESTED_COMPONENT_ID ]: mockDocument( MOCK_NESTED_COMPONENT_ID, true ),
};

describe( '<EditComponent />', () => {
	let store: Store< SliceState< typeof slice > >;
	let editedDocument: V1Document;
	let attachPreviewCallback: () => void;
	const switchDocumentCallback = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		registerSlice( slice );
		store = __createStore();

		jest.mocked( getV1DocumentsManager ).mockReturnValue( {
			getCurrent: () => editedDocument,
			getCurrentId: () => editedDocument.id,
			getInitialId: () => MOCK_DOCUMENT_ID,
			invalidateCache: jest.fn(),
			documents: {},
		} as unknown as ReturnType< typeof getV1DocumentsManager > );

		jest.mocked( switchDocumentCallback ).mockImplementation( ( { id }: { id: number } ) => {
			editedDocument = MOCK_POST_DATA[ id as keyof typeof MOCK_POST_DATA ];

			updateCurrentDocument();
		} );

		jest.mocked( __privateListenTo ).mockImplementation( ( event, callback ) => {
			event = Array.isArray( event ) ? event[ 0 ] : event;
			if ( event.type === 'command' && event.name === 'editor/documents/attach-preview' ) {
				attachPreviewCallback = callback as () => void;
			}

			return () => {};
		} );

		jest.mocked( __privateRunCommand ).mockImplementation( async ( command, args ) => {
			if ( command === 'editor/documents/attach-preview' ) {
				attachPreviewCallback?.();

				return;
			}

			if ( command === 'editor/documents/switch' ) {
				switchDocumentCallback( args );
			}
		} );

		jest.mocked( selectLoadIsPending ).mockReturnValue( false );
	} );

	it( 'should show the modal when a component is edited', () => {
		// Arrange.
		renderWithStore( <EditComponent />, store );

		// Act.
		editedDocument = MOCK_POST_DATA[ MOCK_DOCUMENT_ID ];
		updateCurrentDocument();

		// Assert.
		expect( screen.queryByLabelText( 'mock-backdrop' ) ).not.toBeInTheDocument();

		// Act.
		editedDocument = MOCK_POST_DATA[ MOCK_COMPONENT_ID ];
		updateCurrentDocument();

		// Assert.
		expect( screen.getByLabelText( 'mock-backdrop' ) ).toBeInTheDocument();
		expect( apiClient.lockComponent ).not.toHaveBeenCalled();
	} );

	it( 'should close the modal when the backdrop is clicked', () => {
		// Arrange.
		editedDocument = MOCK_POST_DATA[ MOCK_COMPONENT_ID ];
		renderWithStore( <EditComponent />, store );
		updateCurrentDocument();

		// Assert.
		expect( screen.getByLabelText( 'mock-backdrop' ) ).toBeInTheDocument();

		// Act.
		const backdrop = screen.getByLabelText( 'mock-backdrop' );
		fireEvent.click( backdrop );

		// Assert.
		expect( switchDocumentCallback ).toHaveBeenCalledWith( {
			id: MOCK_DOCUMENT_ID,
			mode: 'autosave',
			setAsInitial: false,
			shouldScroll: false,
		} );
		expect( screen.queryByLabelText( 'mock-backdrop' ) ).not.toBeInTheDocument();

		expect( apiClient.unlockComponent ).toHaveBeenCalledTimes( 1 );
		expect( apiClient.unlockComponent ).toHaveBeenCalledWith( MOCK_COMPONENT_ID );
	} );

	it( 'should responsively go back upon backdrop clicks through components ancestry chain', () => {
		// Arrange.
		editedDocument = MOCK_POST_DATA[ MOCK_DOCUMENT_ID ];
		renderWithStore( <EditComponent />, store );
		updateCurrentDocument();

		// Assert.
		expect( screen.queryByLabelText( 'mock-backdrop' ) ).not.toBeInTheDocument();

		[ MOCK_COMPONENT_ID, MOCK_NESTED_COMPONENT_ID ].forEach( ( id ) => {
			editedDocument = MOCK_POST_DATA[ id as keyof typeof MOCK_POST_DATA ];
			updateCurrentDocument();

			// Assert.
			expect( screen.getByLabelText( 'mock-backdrop' ) ).toBeInTheDocument();
		} );

		expect( apiClient.unlockComponent ).toHaveBeenNthCalledWith( 1, MOCK_COMPONENT_ID );

		// Act.
		let backdrop = screen.getByLabelText( 'mock-backdrop' );
		fireEvent.click( backdrop );

		// Assert.
		expect( switchDocumentCallback ).toHaveBeenNthCalledWith( 1, {
			id: MOCK_COMPONENT_ID,
			mode: 'autosave',
			selector: '[data-id="123"]',
			setAsInitial: false,
			shouldScroll: false,
		} );

		expect( apiClient.unlockComponent ).toHaveBeenNthCalledWith( 2, MOCK_NESTED_COMPONENT_ID );

		// Act.
		backdrop = screen.getByLabelText( 'mock-backdrop' );
		fireEvent.click( backdrop );

		// Assert.
		expect( screen.queryByLabelText( 'mock-backdrop' ) ).not.toBeInTheDocument();
		expect( switchDocumentCallback ).toHaveBeenNthCalledWith( 2, {
			id: MOCK_DOCUMENT_ID,
			mode: 'autosave',
			setAsInitial: false,
			shouldScroll: false,
		} );

		expect( apiClient.unlockComponent ).toHaveBeenNthCalledWith( 3, MOCK_COMPONENT_ID );
		expect( apiClient.unlockComponent ).toHaveBeenCalledTimes( 3 );
	} );
} );

function mockDocument( id: number, isComponent: boolean = false ) {
	return {
		...createMockDocument( {
			id,
		} ),
		container: {
			view: {
				el: createDOMElement( {
					tag: 'div',
					dataset: isComponent
						? {
								id: id.toString(),
						  }
						: {},
					children: [
						createDOMElement( {
							tag: 'div',
							children: [
								createDOMElement( { tag: 'div' } ), // the component's actual root element
							],
						} ),
					],
				} ),
			},
		},
		config: {
			type: isComponent ? COMPONENT_DOCUMENT_TYPE : 'wp-page',
		},
	} as unknown as V1Document;
}

function updateCurrentDocument() {
	act( () => {
		__privateRunCommand( 'editor/documents/attach-preview' );
	} );
}
