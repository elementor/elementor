import { render, fireEvent } from '@testing-library/react';
import { useElementSelection } from 'elementor-regions/navigator/hooks';

const mockStore = {
	'document/elements/selection': [
		'test-section-1',
	],
};

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( selector ) => selector( mockStore ) ),
} ) );

jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useCallback: ( callback ) => callback,
} ) );

describe( 'useElementSelection()', () => {
	beforeAll( () => {
		require( 'elementor/tests/jest/setup/editor' );

		global.$e.run = jest.fn();
		global.elementor.getContainer = jest.fn( () => {} );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'Should retrieve single element selection state', () => {
		const [ elementSelection1 ] = useElementSelection( 'test-section-1' ),
			[ elementSelection2 ] = useElementSelection( 'test-section-2' );

		expect( elementSelection1 ).toEqual( true );
		expect( elementSelection2 ).toEqual( false );
	} );

	it( 'Should toggle-selection on `setElementSelection`', () => {
		const [ , setElementSelection ] = useElementSelection( 'test-section-1' );

		setElementSelection();

		expect( global.$e.run ).toBeCalledTimes( 1 );
		expect( global.$e.run ).toBeCalledWith(
			'document/elements/toggle-selection',
			expect.any( Object )
		);
	} );

	it( 'Should retrieve multiple element selection state', () => {
		const [ elementsSelection ] = useElementSelection();

		expect( elementsSelection ).toEqual(
			mockStore[ 'document/elements/selection' ]
		);
	} );

	it( 'Should select-all on `setElementSelection`', () => {
		const [ , setElementSelection ] = useElementSelection();

		setElementSelection();

		expect( global.$e.run ).toBeCalledTimes( 1 );
		expect( global.$e.run ).toBeCalledWith( 'document/elements/select-all' );
	} );
} );
