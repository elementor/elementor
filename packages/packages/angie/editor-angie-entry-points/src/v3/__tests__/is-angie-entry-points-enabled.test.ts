import { isAngieEntryPointsEnabled } from '../is-angie-entry-points-enabled';

describe( 'isAngieEntryPointsEnabled', () => {
	it( 'returns true while Show AI check is stubbed', () => {
		// Act
		const enabled = isAngieEntryPointsEnabled();

		// Assert
		expect( enabled ).toBe( true );
	} );
} );