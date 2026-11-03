import { mergeIconsById } from '../merge-icons-by-id';

const icon = ( library: string, name: string, aliases: string[] = [] ) => ( {
	id: `${ library }:${ name }`,
	library,
	name,
	aliases,
} );

describe( 'mergeIconsById', () => {
	it( 'drops a secondary icon with the same id', () => {
		// Arrange.
		const primary = [ icon( 'fa-solid', 'star' ) ];

		// Act.
		const merged = mergeIconsById( primary, [ icon( 'fa-solid', 'star' ), icon( 'fa-solid', 'bolt' ) ] );

		// Assert.
		expect( merged.map( ( item ) => item.id ) ).toEqual( [ 'fa-solid:star', 'fa-solid:bolt' ] );
	} );

	it( 'drops a secondary icon that is known under an alias of a primary icon in the same library', () => {
		// Arrange.
		const primary = [ icon( 'fa-solid', 'house', [ 'home' ] ) ];

		// Act.
		const merged = mergeIconsById( primary, [ icon( 'fa-solid', 'home' ), icon( 'fa-solid', 'heart' ) ] );

		// Assert.
		expect( merged.map( ( item ) => item.id ) ).toEqual( [ 'fa-solid:house', 'fa-solid:heart' ] );
	} );

	it( 'keeps an icon with the same name in another library', () => {
		// Arrange.
		const primary = [ icon( 'fa-solid', 'house', [ 'home' ] ) ];

		// Act.
		const merged = mergeIconsById( primary, [ icon( 'fa-light', 'home' ) ] );

		// Assert.
		expect( merged ).toHaveLength( 2 );
	} );
} );
