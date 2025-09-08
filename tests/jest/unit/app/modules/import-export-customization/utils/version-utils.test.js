/**
 * @jest-environment jsdom
 */

import {
	compareVersions,
	isVersionLessThan,
} from '../../../../../../../app/modules/import-export-customization/assets/js/import/utils/version-utils';

describe( 'Version Utils', () => {
	describe( 'compareVersions', () => {
		test( 'should return negative when first version is older', () => {
			expect( compareVersions( '3.9.1', '3.33.0' ) ).toBeLessThan( 0 );
			expect( compareVersions( '3.32.0', '3.33.0' ) ).toBeLessThan( 0 );
			expect( compareVersions( '2.5.10', '3.0.0' ) ).toBeLessThan( 0 );
			expect( compareVersions( '1.0.0', '2.0.0' ) ).toBeLessThan( 0 );
		} );

		test( 'should return positive when first version is newer', () => {
			expect( compareVersions( '3.33.1', '3.33.0' ) ).toBeGreaterThan( 0 );
			expect( compareVersions( '4.0.0', '3.33.0' ) ).toBeGreaterThan( 0 );
			expect( compareVersions( '3.33.10', '3.33.2' ) ).toBeGreaterThan( 0 );
		} );

		test( 'should return zero when versions are equal', () => {
			expect( compareVersions( '3.33.0', '3.33.0' ) ).toBe( 0 );
			expect( compareVersions( '1.0.0', '1.0.0' ) ).toBe( 0 );
			expect( compareVersions( '10.5.2', '10.5.2' ) ).toBe( 0 );
		} );

		test( 'should handle different version part lengths', () => {
			expect( compareVersions( '3.33', '3.33.0' ) ).toBe( 0 );
			expect( compareVersions( '3.33.0', '3.33' ) ).toBe( 0 );
			expect( compareVersions( '3.33.1', '3.33' ) ).toBeGreaterThan( 0 );
			expect( compareVersions( '3.33', '3.33.1' ) ).toBeLessThan( 0 );
		} );

		test( 'should handle single digit versions', () => {
			expect( compareVersions( '3', '3.0.0' ) ).toBe( 0 );
			expect( compareVersions( '4', '3.0.0' ) ).toBeGreaterThan( 0 );
			expect( compareVersions( '2', '3.0.0' ) ).toBeLessThan( 0 );
		} );

		test( 'should handle null/undefined/empty values', () => {
			expect( compareVersions( null, '3.33.0' ) ).toBeLessThan( 0 );
			expect( compareVersions( undefined, '3.33.0' ) ).toBeLessThan( 0 );
			expect( compareVersions( '', '3.33.0' ) ).toBeLessThan( 0 );
			expect( compareVersions( '3.33.0', null ) ).toBeGreaterThan( 0 );
			expect( compareVersions( '3.33.0', undefined ) ).toBeGreaterThan( 0 );
			expect( compareVersions( '3.33.0', '' ) ).toBeGreaterThan( 0 );
			expect( compareVersions( null, null ) ).toBe( 0 );
			expect( compareVersions( undefined, undefined ) ).toBe( 0 );
		} );

		test( 'should handle numeric inputs', () => {
			expect( compareVersions( 3.33, '3.33.0' ) ).toBe( 0 );
			expect( compareVersions( 3.34, '3.33.0' ) ).toBeGreaterThan( 0 );
			expect( compareVersions( 3.32, '3.33.0' ) ).toBeLessThan( 0 );
		} );

		test( 'should handle multi-digit version parts correctly', () => {
			expect( compareVersions( '3.10.0', '3.2.0' ) ).toBeGreaterThan( 0 );
			expect( compareVersions( '3.2.10', '3.2.2' ) ).toBeGreaterThan( 0 );
			expect( compareVersions( '10.0.0', '2.0.0' ) ).toBeGreaterThan( 0 );
		} );

		test( 'should handle edge cases from the original bug report', () => {
			// These are the exact cases that were failing with string comparison
			expect( compareVersions( '3.32.0', '3.33.0' ) ).toBeLessThan( 0 );
			expect( compareVersions( '3.9.1', '3.33.0' ) ).toBeLessThan( 0 );
			expect( compareVersions( '3.33.0', '3.33.0' ) ).toBe( 0 );
			expect( compareVersions( '3.33.1', '3.33.0' ) ).toBeGreaterThan( 0 );
		} );
	} );

	describe( 'isVersionLessThan', () => {
		test( 'should return true when first version is older', () => {
			expect( isVersionLessThan( '3.9.1', '3.33.0' ) ).toBe( true );
			expect( isVersionLessThan( '3.32.0', '3.33.0' ) ).toBe( true );
			expect( isVersionLessThan( '2.5.0', '3.0.0' ) ).toBe( true );
		} );

		test( 'should return false when first version is newer or equal', () => {
			expect( isVersionLessThan( '3.33.1', '3.33.0' ) ).toBe( false );
			expect( isVersionLessThan( '3.33.0', '3.33.0' ) ).toBe( false );
			expect( isVersionLessThan( '4.0.0', '3.33.0' ) ).toBe( false );
		} );
	} );


	describe( 'Real-world Elementor version scenarios', () => {
		test( 'should correctly identify old Elementor versions', () => {
			const oldVersions = [ '3.9.1', '3.32.0', '3.32.9', '3.10.0', '2.9.0' ];
			const currentVersion = '3.33.0';

			oldVersions.forEach( ( version ) => {
				expect( isVersionLessThan( version, currentVersion ) ).toBe( true );
			} );
		} );

		test( 'should correctly identify new Elementor versions using compareVersions', () => {
			const newVersions = [ '3.33.1', '3.34.0', '4.0.0', '3.40.0' ];
			const currentVersion = '3.33.0';

			newVersions.forEach( ( version ) => {
				expect( compareVersions( version, currentVersion ) ).toBeGreaterThan( 0 );
			} );
		} );

		test( 'should handle pre-release and dev versions gracefully', () => {
			// These should be treated as the base version without the suffix
			expect( compareVersions( '3.33.0', '3.33.0' ) ).toBe( 0 );
			expect( compareVersions( '3.32.5', '3.33.0' ) ).toBeLessThan( 0 );
		} );
	} );
} );
