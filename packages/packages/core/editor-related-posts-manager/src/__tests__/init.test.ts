import { getV1CurrentDocument } from '@elementor/editor-documents';
import { registerDataHook } from '@elementor/editor-v1-adapters';

const mockReset = jest.fn();
const mockSetCurrentDocumentId = jest.fn();

jest.mock( '@elementor/editor-styles-repository', () => ( {
	createStylesProvider: jest.fn( () => ( {
		getKey: () => 'related-posts-styles',
		subscribe: jest.fn(),
		actions: {
			all: () => [],
			get: () => null,
		},
	} ) ),
	stylesRepository: {
		register: jest.fn(),
	},
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	getV1CurrentDocument: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	registerDataHook: jest.fn(),
} ) );

jest.mock( '../api', () => ( {
	reset: ( ...args: unknown[] ) => mockReset( ...args ),
	setCurrentDocumentId: ( ...args: unknown[] ) => mockSetCurrentDocumentId( ...args ),
} ) );

import { init } from '../init';

const mockGetV1CurrentDocument = jest.mocked( getV1CurrentDocument );
const mockRegisterDataHook = jest.mocked( registerDataHook );

describe( 'init', () => {
	let attachPreviewHandler: () => void;

	beforeEach( () => {
		jest.clearAllMocks();

		mockRegisterDataHook.mockImplementation( ( _position, command, callback ) => {
			if ( command === 'editor/documents/attach-preview' ) {
				attachPreviewHandler = callback as () => void;
			}
		} );

		init();
	} );

	it( 'should register an attach-preview hook', () => {
		expect( mockRegisterDataHook ).toHaveBeenCalledWith(
			'after',
			'editor/documents/attach-preview',
			expect.any( Function )
		);
	} );

	it( 'should set the current document id and reset on attach-preview', () => {
		// Arrange.
		mockGetV1CurrentDocument.mockReturnValue( {
			id: 42,
			config: { elements: [] },
		} as ReturnType< typeof getV1CurrentDocument > );

		// Act.
		attachPreviewHandler();

		// Assert.
		expect( mockSetCurrentDocumentId ).toHaveBeenCalledWith( 42 );
		expect( mockReset ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should set a null current document id when attach-preview has no current document', () => {
		// Arrange.
		mockGetV1CurrentDocument.mockReturnValue( {
			id: null,
			config: { elements: [] },
		} as ReturnType< typeof getV1CurrentDocument > );

		// Act.
		attachPreviewHandler();

		// Assert.
		expect( mockSetCurrentDocumentId ).toHaveBeenCalledWith( null );
		expect( mockReset ).toHaveBeenCalledTimes( 1 );
	} );
} );
