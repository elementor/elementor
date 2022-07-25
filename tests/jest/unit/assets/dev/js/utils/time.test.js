// Arrange.
import getUserTimestamp from 'elementor-utils/time';

describe( 'Time Utility', () => {
	test( 'getUserTimestamp()', () => {
		// Act.
		const timestamp = getUserTimestamp();

		// Assert.
		expect( timestamp ).toMatch( /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/ );
	} );
} );
