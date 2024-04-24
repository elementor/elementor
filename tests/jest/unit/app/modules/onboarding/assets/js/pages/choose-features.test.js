import { setSelectedFeatureList } from 'elementor/app/modules/onboarding/assets/js/utils/utils';

describe( 'setSelectedFeatureList function', () => {
	const emptySelectedFeatures = { essential: [], advanced: [] },
		setSelectedFeaturesMock = jest.fn();
	jest.spyOn( React, 'useState' ).mockReturnValue( [ { essential: [], advanced: [] }, setSelectedFeaturesMock ] );

	beforeEach( () => {
		setSelectedFeaturesMock.mockClear(); // Clear mock before each test
	} );

	it.each( [
		[ true, 'essential-1', 'Feature 1', emptySelectedFeatures, { essential: [ 'Feature 1' ], advanced: [] } ],
		[ true, 'advanced-1', 'Feature 1', emptySelectedFeatures, { essential: [], advanced: [ 'Feature 1' ] } ],
		[ true, 'advanced-2', 'Feature 2', { essential: [], advanced: [ 'Feature 1' ] }, { essential: [], advanced: [ 'Feature 1', 'Feature 2' ] } ],
		[ true, 'essential-2', 'Feature 3', { essential: [], advanced: [ 'Feature 1', 'Feature 2' ] }, { essential: [ 'Feature 3' ], advanced: [ 'Feature 1', 'Feature 2' ] } ],
		[ true, 'essential-4', 'Feature 4', { essential: [ 'Feature 3' ], advanced: [ 'Feature 1', 'Feature 2' ] }, { essential: [ 'Feature 3', 'Feature 4' ], advanced: [ 'Feature 1', 'Feature 2' ] } ],
		[ false, 'essential-4', 'Feature 4', { essential: [ 'Feature 3', 'Feature 4' ], advanced: [ 'Feature 1', 'Feature 2' ] }, { essential: [ 'Feature 3' ], advanced: [ 'Feature 1', 'Feature 2' ] } ],
		[ false, 'advanced-1', 'Feature 1', { essential: [ 'Feature 3' ], advanced: [ 'Feature 1', 'Feature 2' ] }, { essential: [ 'Feature 3' ], advanced: [ 'Feature 2' ] } ],
		[ false, 'advanced-2', 'Feature 2', { essential: [ 'Feature 3' ], advanced: [ 'Feature 2' ] }, { essential: [ 'Feature 3' ], advanced: [] } ],
		[ false, 'essential-1', 'Feature 1', { essential: [ 'Feature 1' ], advanced: [] }, emptySelectedFeatures ],
		[ false, 'advanced-1', 'Feature 1', { essential: [], advanced: [ 'Feature 1' ] }, emptySelectedFeatures ],
	] )( 'should add a feature to selectedFeatures when checked is %s', ( checked, id, text, initialSelectedFeatures, finalSelectedFeatures ) => {
		setSelectedFeatureList( checked, id, text, initialSelectedFeatures, setSelectedFeaturesMock );

		// Check if setSelectedFeaturesMock was called with the expected value
		expect( setSelectedFeaturesMock ).toHaveBeenCalledWith( finalSelectedFeatures );
	} );
} );
