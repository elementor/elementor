import { findMatchingGlobalFont } from '../match-global-font';

const GLOBALS = [
	{ id: 'primary', value: 'Roboto', title: 'Primary' },
	{ id: 'secondary', value: 'Roboto', title: 'Secondary' },
	{ id: 'accent', value: 'Arial', title: 'Accent' },
];

describe( 'findMatchingGlobalFont', () => {
	it( 'returns the first global on exact match', () => {
		expect( findMatchingGlobalFont( 'Roboto', GLOBALS ) ).toEqual( {
			id: 'primary',
			value: 'Roboto',
			title: 'Primary',
		} );
	} );

	it( 'returns null when no global matches', () => {
		expect( findMatchingGlobalFont( 'Georgia', GLOBALS ) ).toBeNull();
	} );

	it( 'matches after trimming whitespace in the setting value', () => {
		expect( findMatchingGlobalFont( '  Arial  ', GLOBALS )?.title ).toBe( 'Accent' );
	} );
} );
