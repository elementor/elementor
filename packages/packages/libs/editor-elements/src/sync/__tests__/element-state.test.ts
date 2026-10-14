import {
	getElementState,
	getElementStateParams,
	getElementStateParamsInScope,
	updateElementState,
	updateElementStateParams,
} from '@elementor/editor-elements';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from '../get-container';

jest.mock( '../get-container' );
jest.mock( '@elementor/editor-v1-adapters' );

const ELEMENT_ID = 'test-element-id';
const STATE_PARAMS = [ { key: 'count', label: 'Count', type: 'number' as const, default: 0 } ];
const STATE = { count: 3 };

describe( 'element state', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return empty state params and values when the element has none', () => {
		// Arrange
		const element = createMockContainer( ELEMENT_ID );
		jest.mocked( element.model.get ).mockReturnValue( undefined );

		// Act
		const stateParams = getElementStateParams( ELEMENT_ID );
		const state = getElementState( ELEMENT_ID );

		// Assert
		expect( element.model.get ).toHaveBeenCalledWith( 'state_params' );
		expect( element.model.get ).toHaveBeenCalledWith( 'state' );
		expect( stateParams ).toEqual( [] );
		expect( state ).toEqual( {} );
	} );

	it( 'should set the state params on the model and mark the document as modified', () => {
		// Arrange
		const element = createMockContainer( ELEMENT_ID );

		// Act
		updateElementStateParams( { elementId: ELEMENT_ID, stateParams: STATE_PARAMS } );

		// Assert
		expect( element.model.set ).toHaveBeenCalledWith( 'state_params', STATE_PARAMS );
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );

	it( 'should set the instance state values on the model', () => {
		// Arrange
		const element = createMockContainer( ELEMENT_ID );

		// Act
		updateElementState( { elementId: ELEMENT_ID, state: STATE } );

		// Assert
		expect( element.model.set ).toHaveBeenCalledWith( 'state', STATE );
	} );

	it( 'should list the params in scope with the nearest container winning and page state last', () => {
		// Arrange
		const outer = {
			model: {
				get: jest.fn().mockReturnValue( [ { key: 'count', label: 'Outer', type: 'number', default: 1 } ] ),
			},
		};
		const inner = {
			model: {
				get: jest.fn().mockReturnValue( [ { key: 'count', label: 'Inner', type: 'number', default: 2 } ] ),
			},
			parent: outer,
		};
		jest.mocked( getContainer ).mockReturnValue( inner as never );
		( window as never as { elementor: unknown } ).elementor = {
			documents: { getCurrent: () => ( { container: { settings: { get: () => '{"site":"x","count":9}' } } } ) },
		};

		// Act
		const params = getElementStateParamsInScope( 'inner' );

		// Assert
		expect( params.map( ( { key, label } ) => [ key, label ] ) ).toEqual( [
			[ 'count', 'Inner' ],
			[ 'site', 'site' ],
		] );
	} );

	it( 'should throw when the element is not found', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( null );

		// Act & Assert
		expect( () => updateElementState( { elementId: 'missing', state: STATE } ) ).toThrow(
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
