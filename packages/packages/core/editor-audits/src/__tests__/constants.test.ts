import { CATEGORY_LABELS } from '../constants';

describe( 'CATEGORY_LABELS', () => {
	it( 'labels the compliance category as "Site compliance"', () => {
		// Assert.
		expect( CATEGORY_LABELS.compliance ).toBe( 'Site compliance' );
	} );
} );
