import getUserTimestamp from 'elementor-utils/time';

describe( 'Time Utility', () => {
	test( 'getUserTimestamp()', () => {
		/**
		 * Test that the time format of the string returned from `getUserTimestamp()` matches the ISO8601 time format.
		 */
		// Arrange.
		const date = new Date( 2022, 6, 26, 11, 30, 10, 100 );

		// Act.
		const timestamp = getUserTimestamp( date );

		// Assert.
		// The test matches a regex because the timezone offset can vary between testing machines so it cannot be mocked.
		expect( timestamp ).toMatch( /^2022-07-26T11:30:10.100[+-]\d{2}:\d{2}$/ );
	} );
} );
