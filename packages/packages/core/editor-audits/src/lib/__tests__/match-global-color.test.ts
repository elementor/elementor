import { findMatchingGlobalColor } from '../match-global-color';

const GLOBALS = [
	{ id: 'primary', value: '#6EC1E4', title: 'Primary' },
	{ id: 'secondary', value: '#6EC1E4', title: 'Secondary' },
	{ id: 'accent', value: '#61CE70', title: 'Accent' },
];

describe( 'findMatchingGlobalColor', () => {
	it( 'returns the first global on exact match', () => {
		expect( findMatchingGlobalColor( '#6EC1E4', GLOBALS ) ).toEqual( {
			id: 'primary',
			value: '#6EC1E4',
			title: 'Primary',
		} );
	} );

	it( 'returns null when no global matches', () => {
		expect( findMatchingGlobalColor( '#ff0000', GLOBALS ) ).toBeNull();
	} );

	it( 'matches after trimming whitespace in the setting value', () => {
		expect( findMatchingGlobalColor( '  #61CE70  ', GLOBALS )?.title ).toBe( 'Accent' );
	} );
} );
