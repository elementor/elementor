import { buildElementModel } from '../build-element-model';

const tile = {
	elType: 'widget',
	widgetType: 'e-heading',
	title: 'Heading',
	custom: { isPreset: true, preset_settings: { title: 'Preset' } },
	settings: { title: 'Preset' },
};

describe( 'buildElementModel', () => {
	it( 'should keep the custom data', () => {
		// Act.
		const model = buildElementModel( tile );

		// Assert.
		expect( model.custom ).toEqual( tile.custom );
	} );

	it( 'should not send the promotion type or the settings', () => {
		// Act.
		const model = buildElementModel( { ...tile, promotionType: 'atomic-form' } );

		// Assert.
		expect( model ).not.toHaveProperty( 'promotionType' );
		expect( model ).not.toHaveProperty( 'settings' );
	} );
} );
