import { isWidgetNew } from 'elementor-panel/pages/elements/utils/is-widget-new';

describe( 'isWidgetNew', () => {
	describe( 'when new_until_version is absent', () => {
		test( 'returns false when new_until_version is empty string', () => {
			expect( isWidgetNew( { new_until_version: '' }, '4.3.0' ) ).toBe( false );
		} );

		test( 'returns false when new_until_version is undefined', () => {
			expect( isWidgetNew( { new_until_version: undefined }, '4.3.0' ) ).toBe( false );
		} );

		test( 'returns false when new_until_version is missing', () => {
			expect( isWidgetNew( {}, '4.3.0' ) ).toBe( false );
		} );
	} );

	describe( 'when current version equals the until version (badge window)', () => {
		test( 'returns true when major.minor match exactly', () => {
			expect( isWidgetNew( { new_until_version: '4.3' }, '4.3.0' ) ).toBe( true );
		} );

		test( 'ignores patch — returns true on any patch of the same minor', () => {
			expect( isWidgetNew( { new_until_version: '4.3' }, '4.3.1' ) ).toBe( true );
			expect( isWidgetNew( { new_until_version: '4.3' }, '4.3.9' ) ).toBe( true );
		} );
	} );

	describe( 'when current version is older than until version (badge still shows)', () => {
		test( 'returns true when current minor is behind (same major)', () => {
			expect( isWidgetNew( { new_until_version: '4.3' }, '4.2.0' ) ).toBe( true );
			expect( isWidgetNew( { new_until_version: '4.3' }, '4.1.5' ) ).toBe( true );
		} );

		test( 'returns true when current major is behind', () => {
			expect( isWidgetNew( { new_until_version: '4.3' }, '3.0.0' ) ).toBe( true );
			expect( isWidgetNew( { new_until_version: '5.0' }, '4.9.0' ) ).toBe( true );
		} );
	} );

	describe( 'when current version is newer than until version (badge expires)', () => {
		test( 'returns false when current minor is ahead (same major)', () => {
			expect( isWidgetNew( { new_until_version: '4.3' }, '4.4.0' ) ).toBe( false );
			expect( isWidgetNew( { new_until_version: '4.3' }, '4.10.0' ) ).toBe( false );
		} );

		test( 'returns false when current major is ahead', () => {
			expect( isWidgetNew( { new_until_version: '4.3' }, '5.0.0' ) ).toBe( false );
			expect( isWidgetNew( { new_until_version: '4.3' }, '10.0.0' ) ).toBe( false );
		} );
	} );
} );
