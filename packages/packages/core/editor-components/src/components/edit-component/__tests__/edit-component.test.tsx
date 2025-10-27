import * as React from 'react';
import { createDOMElement, createMockDocument, renderWithStore } from 'test-utils';
import {
	__useNavigateToDocument as useNavigateToDocument,
	getV1DocumentsManager,
	type V1Document,
} from '@elementor/editor-documents';
import {
	__privateRunCommand,
	__privateRunCommand as runCommand,
	registerDataHook,
} from '@elementor/editor-v1-adapters';
import { __createStore, __registerSlice as registerSlice, type SliceState, type Store } from '@elementor/store';
import { act, fireEvent, screen } from '@testing-library/react';

import { selectComponentsObject, selectLoadIsPending, slice } from '../../../store/store';
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
	registerDataHook: jest.fn(),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	...jest.requireActual( '@elementor/editor-documents' ),
	getV1DocumentsManager: jest.fn(),
	__useNavigateToDocument: jest.fn(),
} ) );

jest.mock( '../../../store/store', () => ( {
	...jest.requireActual( '../../../store/store' ),
	selectComponentsObject: jest.fn(),
	selectLoadIsPending: jest.fn(),
} ) );

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
	const mockNavigateToDocument = jest.fn();

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
		} );

		jest.mocked( mockNavigateToDocument ).mockImplementation( ( id: number ) => {
			editedDocument = MOCK_POST_DATA[ id as keyof typeof MOCK_POST_DATA ];

			updateCurrentDocument();
		} );
		jest.mocked( useNavigateToDocument ).mockImplementation( () => mockNavigateToDocument );

		jest.mocked( registerDataHook ).mockImplementation( ( position, command, callback ) => {
			if ( command === 'editor/documents/attach-preview' && position === 'after' ) {
				attachPreviewCallback = callback as () => void;
			}

			return null as never;
		} );

		jest.mocked( __privateRunCommand ).mockImplementation( async ( command ) => {
			if ( command === 'editor/documents/attach-preview' ) {
				attachPreviewCallback?.();
			}
		} );

		jest.mocked( selectComponentsObject ).mockReturnValue( {
			[ MOCK_COMPONENT_ID ]: {
				id: MOCK_COMPONENT_ID,
				name: 'Mock Component',
			},
			[ MOCK_NESTED_COMPONENT_ID ]: {
				id: MOCK_NESTED_COMPONENT_ID,
				name: 'Mock Nested Component',
			},
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
		expect( screen.queryByLabelText( 'mock-backdrop' ) ).not.toBeInTheDocument();
		expect( mockNavigateToDocument ).toHaveBeenCalledWith( MOCK_DOCUMENT_ID, {
			mode: 'autosave',
			setAsInitial: false,
			shouldScroll: false,
		} );
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

		// Act.
		let backdrop = screen.getByLabelText( 'mock-backdrop' );
		fireEvent.click( backdrop );

		// Assert.
		expect( mockNavigateToDocument ).toHaveBeenNthCalledWith(
			1,
			MOCK_COMPONENT_ID,
			{
				mode: 'autosave',
				selector: '[data-id="123"]',
				setAsInitial: false,
				shouldScroll: false,
			},
			false
		);

		// Act.
		backdrop = screen.getByLabelText( 'mock-backdrop' );
		fireEvent.click( backdrop );

		// Assert.
		expect( screen.queryByLabelText( 'mock-backdrop' ) ).not.toBeInTheDocument();
		expect( mockNavigateToDocument ).toHaveBeenNthCalledWith( 2, MOCK_DOCUMENT_ID, {
			mode: 'autosave',
			setAsInitial: false,
			shouldScroll: false,
		} );
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
					children: [ createDOMElement( { tag: 'div' } ) ],
				} ),
			},
		},
	} as unknown as V1Document;
}

function updateCurrentDocument() {
	act( () => {
		runCommand( 'editor/documents/attach-preview' );
	} );
}
