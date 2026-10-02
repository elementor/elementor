import { getElementHandlers, updateElementHandlers } from '@elementor/editor-elements';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from '../get-container';

jest.mock( '../get-container' );
jest.mock( '@elementor/editor-v1-adapters' );

const ELEMENT_ID = 'test-element-id';
const HANDLERS = [ { event: 'click' as const, code: 'setState( "count", ( c ) => c + 1 );' } ];

describe( 'element handlers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return an empty list when the element has no handlers', () => {
		// Arrange
		const element = createMockContainer( ELEMENT_ID );
		jest.mocked( element.model.get ).mockReturnValue( undefined );

		// Act
		const handlers = getElementHandlers( ELEMENT_ID );

		// Assert
		expect( element.model.get ).toHaveBeenCalledWith( 'handlers' );
		expect( handlers ).toEqual( [] );
	} );

	it( 'should return the element handlers', () => {
		// Arrange
		const element = createMockContainer( ELEMENT_ID );
		jest.mocked( element.model.get ).mockReturnValue( HANDLERS );

		// Act
		const handlers = getElementHandlers( ELEMENT_ID );

		// Assert
		expect( handlers ).toEqual( HANDLERS );
	} );

	it( 'should set the handlers on the model and mark the document as modified', () => {
		// Arrange
		const element = createMockContainer( ELEMENT_ID );

		// Act
		updateElementHandlers( { elementId: ELEMENT_ID, handlers: HANDLERS } );

		// Assert
		expect( element.model.set ).toHaveBeenCalledWith( 'handlers', HANDLERS );
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );

	it( 'should throw when the element is not found', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( null );

		// Act & Assert
		expect( () => updateElementHandlers( { elementId: 'missing', handlers: HANDLERS } ) ).toThrow(
			'Element with id missing not found'
		);
		expect( runCommandSync ).not.toHaveBeenCalled();
	} );
} );

function createMockContainer( elementId: string ) {
	const element = {
		id: elementId,
		model: {
			get: jest.fn(),
			set: jest.fn(),
		},
	};

	jest.mocked( getContainer ).mockImplementation( ( id ) => ( id === elementId ? ( element as never ) : null ) );

	return element;
}
