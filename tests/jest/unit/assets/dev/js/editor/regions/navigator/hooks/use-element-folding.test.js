import { render, fireEvent } from '@testing-library/react';
import { useElementFolding } from 'elementor-regions/navigator/hooks';

const mockStore = {
	'navigator/folding': {
		'test-section-1': true,
		'test-section-2': false,
	},
};

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( selector ) => selector( mockStore ) ),
} ) );

jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useCallback: ( callback ) => callback,
	useEffect: ( callback ) => callback(),
} ) );

describe( 'useElementSelection()', () => {
	beforeAll( () => {
		require( 'elementor/tests/jest/setup/editor' );

		global.$e.run = jest.fn();
		global.elementor.getContainer = jest.fn( () => ( {} ) );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'Should initialize element folding state to store', () => {
		// Undefined element, should be initialized to `false`.
		useElementFolding( 'test-section-3' );

		expect( global.$e.run ).toBeCalledTimes( 1 );
		expect( global.$e.run ).toBeCalledWith(
			'navigator/elements/toggle-folding',
			{
				container: expect.any( Object ),
				state: false,
			}
		);
	} );

	it( 'Should retrieve single element selection state and `true` by default', () => {
		const [ elementFolding1 ] = useElementFolding( 'test-section-1' ),
			[ elementFolding2 ] = useElementFolding( 'test-section-2' ),
			// Undefined element, should return `true` by default.
			[ elementFolding3 ] = useElementFolding( 'test-section-3' );

		expect( elementFolding1 ).toEqual( true );
		expect( elementFolding2 ).toEqual( false );
		expect( elementFolding3 ).toEqual( true );
	} );

	it( 'Should toggle-folding on `setElementFolding`', () => {
		const [ , setElementFolding ] = useElementFolding( 'test-section-1' );

		setElementFolding();

		expect( global.$e.run ).toBeCalledTimes( 1 );
		expect( global.$e.run ).toBeCalledWith(
			'navigator/elements/toggle-folding',
			{
				container: expect.any( Object ),
				state: undefined,
			}
		);
	} );

	it( 'Should toggle-folding to `true` on `setElementFolding( true )`', () => {
		const [ , setElementFolding ] = useElementFolding( 'test-section-1' );

		setElementFolding( true );

		expect( global.$e.run ).toBeCalledTimes( 1 );
		expect( global.$e.run ).toBeCalledWith(
			'navigator/elements/toggle-folding',
			{
				container: expect.any( Object ),
				state: true,
			}
		);
	} );

	it( 'Should toggle-folding to `false` on `setElementFolding( false )`', () => {
		const [ , setElementFolding ] = useElementFolding( 'test-section-1' );

		setElementFolding( false );

		expect( global.$e.run ).toBeCalledTimes( 1 );
		expect( global.$e.run ).toBeCalledWith(
			'navigator/elements/toggle-folding',
			{
				container: expect.any( Object ),
				state: false,
			}
		);
	} );

	it( 'Should retrieve multiple element folding state', () => {
		const [ elementsFolding ] = useElementFolding();

		expect( elementsFolding ).toEqual(
			mockStore[ 'navigator/folding' ]
		);
	} );

	it( 'Should toggle-folding-all to `true` state on `setElementFolding( true )`', () => {
		const [ , setElementFolding ] = useElementFolding();

		setElementFolding( true );

		expect( global.$e.run ).toBeCalledTimes( 1 );
		expect( global.$e.run ).toBeCalledWith(
			'navigator/elements/toggle-folding-all',
			{ state: true }
		);
	} );

	it( 'Should toggle-folding-all to `false` state on `setElementFolding( false )`', () => {
		const [ , setElementFolding ] = useElementFolding();

		setElementFolding( false );

		expect( global.$e.run ).toBeCalledTimes( 1 );
		expect( global.$e.run ).toBeCalledWith(
			'navigator/elements/toggle-folding-all',
			{ state: false }
		);
	} );
} );
