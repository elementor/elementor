import { isInvalidMenuLocationError, resolveMenuLocation } from '../menu-locations';

describe( '@elementor/site-builder/deploy/menu-locations', () => {
	describe( 'resolveMenuLocation', () => {
		it( 'returns the first matching candidate present in available slugs', () => {
			const result = resolveMenuLocation(
				[ 'menu-1', 'main', 'footer' ],
				[ 'header', 'main' ],
			);

			expect( result ).toBe( 'main' );
		} );

		it( 'falls back to a slug matching the pattern when no candidate matches', () => {
			const result = resolveMenuLocation(
				[ 'menu-1', 'primary-navigation' ],
				[ 'header' ],
				/navigation/i,
			);

			expect( result ).toBe( 'primary-navigation' );
		} );

		it( 'returns undefined when nothing matches instead of an arbitrary slug', () => {
			const result = resolveMenuLocation(
				[ 'footer', 'social' ],
				[ 'header' ],
				/header|main/i,
			);

			expect( result ).toBeUndefined();
		} );
	} );

	describe( 'isInvalidMenuLocationError', () => {
		it( 'detects nested rest_invalid_menu_location errors', () => {
			expect( isInvalidMenuLocationError( {
				code: 'rest_invalid_param',
				data: { details: { locations: { code: 'rest_invalid_menu_location' } } },
			} ) ).toBe( true );
		} );

		it( 'detects top-level rest_invalid_menu_location errors', () => {
			expect( isInvalidMenuLocationError( { code: 'rest_invalid_menu_location' } ) ).toBe( true );
		} );

		it( 'returns false for unrelated errors and non-objects', () => {
			expect( isInvalidMenuLocationError( { code: 'rest_forbidden' } ) ).toBe( false );
			expect( isInvalidMenuLocationError( null ) ).toBe( false );
			expect( isInvalidMenuLocationError( 'error' ) ).toBe( false );
		} );
	} );
} );
