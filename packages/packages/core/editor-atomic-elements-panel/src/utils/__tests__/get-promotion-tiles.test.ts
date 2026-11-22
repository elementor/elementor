import { type WidgetsCache } from '../get-atomic-widgets';
import { getPromotionTiles } from '../get-promotion-tiles';
import { groupWidgets } from '../group-widgets';

const setPromotions = ( atomicWidgetPromotions?: unknown ) => {
	( window as unknown as { elementor: unknown } ).elementor = { config: { atomicWidgetPromotions } };
};

const promotion = ( names: string[] ) => ( {
	type: 'atomic-form',
	widgets: names.map( ( name ) => ( { name, title: name, icon: 'eicon-x', categories: '["atomic-form"]' } ) ),
} );

describe( 'getPromotionTiles', () => {
	it( 'should build locked tiles from the promotions', () => {
		// Arrange.
		setPromotions( [ promotion( [ 'e-form' ] ) ] );

		// Act.
		const tiles = getPromotionTiles( {} );

		// Assert.
		expect( tiles ).toEqual( [
			{
				tile: expect.objectContaining( { widgetType: 'e-form', promotionType: 'atomic-form' } ),
				categories: [ 'atomic-form' ],
			},
		] );
	} );

	it( 'should skip promotions of registered widgets', () => {
		// Arrange.
		setPromotions( [ promotion( [ 'e-form', 'e-form-input' ] ) ] );
		const registered = { 'e-form': { title: 'Form', atomic: true } } as unknown as WidgetsCache;

		// Act.
		const tiles = getPromotionTiles( registered );

		// Assert.
		expect( tiles.map( ( { tile } ) => tile.widgetType ) ).toEqual( [ 'e-form-input' ] );
	} );

	it( 'should return nothing without promotions', () => {
		// Arrange.
		setPromotions( undefined );

		// Act & Assert.
		expect( getPromotionTiles( {} ) ).toEqual( [] );
	} );

	it( 'should place locked tiles in their group', () => {
		// Arrange.
		setPromotions( [ promotion( [ 'e-form-input' ] ) ] );

		// Act.
		const groups = groupWidgets( {}, getPromotionTiles( {} ) );

		// Assert.
		expect( groups.map( ( { id } ) => id ) ).toEqual( [ 'form' ] );
		expect( groups[ 0 ].tiles[ 0 ].promotionType ).toBe( 'atomic-form' );
	} );
} );
