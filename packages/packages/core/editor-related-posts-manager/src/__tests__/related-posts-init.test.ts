import { getV1CurrentDocument } from '@elementor/editor-documents';
import { registerDataHook } from '@elementor/editor-v1-adapters';

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
	reset: jest.fn(),
	setCurrentDocumentId: jest.fn(),
} ) );

import { reset, setCurrentDocumentId } from '../api';
import { init } from '../init';

const { stylesRepository } = require( '@elementor/editor-styles-repository' );

const mockGetV1CurrentDocument = jest.mocked( getV1CurrentDocument );
const mockRegisterDataHook = jest.mocked( registerDataHook );
const mockReset = jest.mocked( reset );
const mockSetCurrentDocumentId = jest.mocked( setCurrentDocumentId );

describe( 'init', () => {
	let attachPreviewHandler: () => void;

	beforeEach( () => {
		jest.clearAllMocks();

		init();

		const call = mockRegisterDataHook.mock.calls.find( ( [ , cmd ] ) => cmd === 'editor/documents/attach-preview' );
		attachPreviewHandler = ( call?.[ 2 ] as () => void ) ?? ( () => {} );
	} );

	it( 'should register the related posts styles provider', () => {
		expect( stylesRepository.register ).toHaveBeenCalledTimes( 1 );
		expect( stylesRepository.register ).toHaveBeenCalledWith(
			expect.objectContaining( { getKey: expect.any( Function ) } )
		);
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
		} as unknown as ReturnType< typeof getV1CurrentDocument > );

		// Act.
		attachPreviewHandler();

		// Assert.
		expect( mockSetCurrentDocumentId ).toHaveBeenCalledWith( 42 );
		expect( mockReset ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should set a null current document id when attach-preview has no current document', () => {
		// Arrange.
		mockGetV1CurrentDocument.mockReturnValue( {
			id: undefined,
			config: { elements: [] },
		} as unknown as ReturnType< typeof getV1CurrentDocument > );

		// Act.
		attachPreviewHandler();

		// Assert.
		expect( mockSetCurrentDocumentId ).toHaveBeenCalledWith( null );
		expect( mockReset ).toHaveBeenCalledTimes( 1 );
	} );
} );
