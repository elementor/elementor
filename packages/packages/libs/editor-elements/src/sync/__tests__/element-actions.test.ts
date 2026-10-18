import { type ActionItemPropValue, getElementActions, updateElementActions } from '@elementor/editor-elements';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from '../get-container';

jest.mock( '../get-container' );
jest.mock( '@elementor/editor-v1-adapters' );

const ELEMENT_ID = 'test-element-id';
const ITEMS: ActionItemPropValue[] = [
	{
		$$type: 'event-action',
		value: {
			on: { $$type: 'string', value: 'click' },
			action: {
				$$type: 'action-call',
				value: {
					name: { $$type: 'string', value: 'state/toggle' },
					args: { $$type: 'action-args', value: { key: { $$type: 'string', value: 'open' } } },
				},
			},
		},
	},
];

describe( 'element actions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return an empty list when the element has no actions', () => {
		// Arrange
		const element = createMockContainer( ELEMENT_ID );
		jest.mocked( element.model.get ).mockReturnValue( undefined );

		// Act
		const actions = getElementActions( ELEMENT_ID );

		// Assert
		expect( element.model.get ).toHaveBeenCalledWith( 'actions' );
		expect( actions ).toEqual( { version: 1, items: [] } );
	} );

	it( 'should return the element actions', () => {
		// Arrange
		const element = createMockContainer( ELEMENT_ID );
		jest.mocked( element.model.get ).mockReturnValue( { version: 1, items: ITEMS } );

		// Act
		const actions = getElementActions( ELEMENT_ID );

		// Assert
		expect( actions.items ).toEqual( ITEMS );
	} );

	it( 'should set the actions on the model and mark the document as modified', () => {
		// Arrange
		const element = createMockContainer( ELEMENT_ID );

		// Act
		updateElementActions( { elementId: ELEMENT_ID, items: ITEMS } );

		// Assert
		expect( element.model.set ).toHaveBeenCalledWith( 'actions', { version: 1, items: ITEMS } );
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
		expect( () => updateElementActions( { elementId: 'missing', items: ITEMS } ) ).toThrow(
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
