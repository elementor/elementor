import { type WidgetsCache } from '../get-atomic-widgets';
import { groupWidgets, type PromotionTile } from '../group-widgets';

const widget = ( title: string, categories?: string[] ) => ( { title, atomic: true, controls: {}, categories } );

const locked = ( widgetType: string, categories: string[] ): PromotionTile => ( {
	tile: { elType: 'widget', widgetType, title: widgetType, promotionType: 'pro' },
	categories,
} );

const GROUP_ORDER: Record< string, string[] > = {
	layout: [ 'e-div-block', 'e-flexbox', 'e-grid' ],
	basic: [ 'e-heading', 'e-paragraph', 'e-image', 'e-svg', 'e-button', 'e-divider' ],
	media: [ 'e-youtube', 'e-self-hosted-video', 'e-background-video', 'e-google-maps' ],
	interactive: [ 'e-tabs', 'e-accordion', 'e-list', 'e-menu', 'e-collection-loop', 'e-carousel' ],
	form: [ 'e-form' ],
};

const INVENTORY: [ string, string ][] = Object.entries( GROUP_ORDER ).flatMap( ( [ groupId, types ] ) =>
	types.map( ( type ): [ string, string ] => [ type, groupId ] )
);

const tileTypes = ( groups: ReturnType< typeof groupWidgets >, id: string ) =>
	groups.find( ( group ) => group.id === id )?.tiles.map( ( tile ) => tile.widgetType );

describe( 'groupWidgets', () => {
	it( 'should group registered widgets by the local map and hide empty groups', () => {
		// Arrange.
		const widgets = {
			'e-flexbox': widget( 'Flexbox' ),
			'e-heading': widget( 'Heading' ),
		} as unknown as WidgetsCache;

		// Act.
		const groups = groupWidgets( widgets );

		// Assert.
		expect( groups.map( ( { id } ) => id ) ).toEqual( [ 'layout', 'basic' ] );
	} );

	it( 'should place widgets of the atomic-form category in the form group', () => {
		// Arrange.
		const widgets = {
			'e-form-input': widget( 'Input', [ 'atomic-form' ] ),
			'e-form-label': widget( 'Label', [ 'atomic-form' ] ),
		} as unknown as WidgetsCache;

		// Act.
		const groups = groupWidgets( widgets );

		// Assert.
		expect( groups ).toHaveLength( 1 );
		expect( groups[ 0 ].id ).toBe( 'form' );
		expect( groups[ 0 ].tiles ).toHaveLength( 2 );
	} );

	it( 'should place unmapped widgets once in the v4-elements group', () => {
		// Arrange.
		const widgets = { 'e-custom': widget( 'Custom', [ 'v4-elements' ] ) } as unknown as WidgetsCache;

		// Act.
		const groups = groupWidgets( widgets );

		// Assert.
		expect( groups ).toHaveLength( 1 );
		expect( groups[ 0 ].id ).toBe( 'v4-elements' );
		expect( groups[ 0 ].tiles[ 0 ] ).toMatchObject( { widgetType: 'e-custom', elType: 'widget' } );
	} );

	it( 'should keep the preset settings of preset widgets on the tile', () => {
		// Arrange.
		const presetSettings = { tag: { $$type: 'string', value: 'h2' } };
		const widgets = {
			'e-heading': { ...widget( 'Heading' ), custom: { isPreset: true, preset_settings: presetSettings } },
			'e-image': widget( 'Image' ),
		} as unknown as WidgetsCache;

		// Act.
		const [ group ] = groupWidgets( widgets );

		// Assert.
		expect( group.tiles[ 0 ].settings ).toEqual( presetSettings );
		expect( group.tiles[ 1 ].settings ).toBeUndefined();
	} );

	it.each( INVENTORY )( 'should place %s in the %s group', ( type, groupId ) => {
		// Arrange.
		const widgets = { [ type ]: widget( type ) } as unknown as WidgetsCache;

		// Act.
		const groups = groupWidgets( widgets );

		// Assert.
		expect( tileTypes( groups, groupId ) ).toEqual( [ type ] );
	} );

	it( 'should place form fields of the atomic-form category in the form group', () => {
		// Arrange.
		const widgets = { 'e-form-input': widget( 'Input', [ 'atomic-form' ] ) } as unknown as WidgetsCache;

		// Act.
		const groups = groupWidgets( widgets );

		// Assert.
		expect( tileTypes( groups, 'form' ) ).toEqual( [ 'e-form-input' ] );
	} );

	it( 'should order tiles by the inventory regardless of cache order', () => {
		// Arrange.
		const widgets = Object.fromEntries(
			[ ...INVENTORY ].reverse().map( ( [ type ] ) => [ type, widget( type ) ] )
		) as unknown as WidgetsCache;

		// Act.
		const groups = groupWidgets( widgets );

		// Assert.
		Object.entries( GROUP_ORDER ).forEach( ( [ groupId, types ] ) => {
			expect( tileTypes( groups, groupId ) ).toEqual( types );
		} );
	} );

	it( 'should put locked loop and carousel tiles in their interactive slots', () => {
		// Arrange.
		const widgets = { 'e-tabs': widget( 'Tabs' ), 'e-list': widget( 'List' ) } as unknown as WidgetsCache;
		const lockedTiles = [
			locked( 'e-carousel', [ 'v4-elements' ] ),
			locked( 'e-collection-loop', [ 'v4-elements' ] ),
		];

		// Act.
		const groups = groupWidgets( widgets, lockedTiles );

		// Assert.
		expect( tileTypes( groups, 'interactive' ) ).toEqual( [ 'e-tabs', 'e-list', 'e-collection-loop', 'e-carousel' ] );
	} );

	it( 'should place locked form stubs in the form group, form first', () => {
		// Arrange.
		const lockedTiles = [ locked( 'e-form-input', [ 'atomic-form' ] ), locked( 'e-form', [ 'atomic-form' ] ) ];

		// Act.
		const groups = groupWidgets( {}, lockedTiles );

		// Assert.
		expect( tileTypes( groups, 'form' ) ).toEqual( [ 'e-form', 'e-form-input' ] );
	} );

	it( 'should keep one tile per widget type', () => {
		// Arrange.
		const lockedTiles = [ locked( 'e-form-input', [ 'atomic-form' ] ), locked( 'e-form-input', [ 'atomic-form' ] ) ];

		// Act.
		const groups = groupWidgets( {}, lockedTiles );

		// Assert.
		expect( tileTypes( groups, 'form' ) ).toHaveLength( 1 );
	} );

	it( 'should keep the real tile when a locked tile has the same widget type', () => {
		// Arrange.
		const widgets = { 'e-tabs': widget( 'Tabs' ) } as unknown as WidgetsCache;

		// Act.
		const groups = groupWidgets( widgets, [ locked( 'e-tabs', [ 'v4-elements' ] ) ] );

		// Assert.
		expect( groups[ 0 ].tiles ).toHaveLength( 1 );
		expect( groups[ 0 ].tiles[ 0 ].promotionType ).toBeUndefined();
	} );

	it( 'should fall back to Atomic Elements for an unmapped atomic', () => {
		// Arrange.
		const widgets = {
			'acme-atom': widget( 'Atom', [ 'v4-elements' ] ),
			'acme-other': widget( 'Other', [ 'acme-category' ] ),
		} as unknown as WidgetsCache;

		// Act.
		const groups = groupWidgets( widgets );

		// Assert.
		expect( tileTypes( groups, 'v4-elements' ) ).toEqual( [ 'acme-atom', 'acme-other' ] );
	} );
} );
