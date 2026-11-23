import { type WidgetsCache } from '../get-atomic-widgets';
import { groupWidgets } from '../group-widgets';

const widget = ( title: string, categories?: string[] ) => ( { title, atomic: true, controls: {}, categories } );

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
} );
