import { findMatchingGlobalByValue } from '../match-global-by-value';

const GLOBALS = [
	{ id: 'primary', value: '#6EC1E4', title: 'Primary' },
	{ id: 'secondary', value: '#6EC1E4', title: 'Secondary' },
	{ id: 'accent', value: '#61CE70', title: 'Accent' },
];

describe( 'findMatchingGlobalByValue', () => {
	it( 'returns the first global on exact match', () => {
		expect( findMatchingGlobalByValue( '#6EC1E4', GLOBALS ) ).toEqual( {
			id: 'primary',
			value: '#6EC1E4',
			title: 'Primary',
		} );
	} );

	it( 'returns null when no global matches', () => {
		expect( findMatchingGlobalByValue( '#ff0000', GLOBALS ) ).toBeNull();
	} );

	it( 'matches after trimming whitespace in the setting value', () => {
		expect( findMatchingGlobalByValue( '  #61CE70  ', GLOBALS )?.title ).toBe( 'Accent' );
	} );
} );
