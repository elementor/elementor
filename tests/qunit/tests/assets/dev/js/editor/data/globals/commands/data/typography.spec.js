import * as eData from 'elementor/tests/qunit/mock/e-data';

export const Typography = () => {
	QUnit.module( 'Typography', ( hooks ) => {
		hooks.before( () => {
			eData.attachMock();
			$e.data.cache.storage.clear();
		} );

		QUnit.test( 'get', async ( assert ) => {
			const result = await $e.data.get( 'globals/typography' ),
				data = result.data.fcf2ddc;

			assert.deepEqual( data.value, {
				typography_typography: 'custom',
				typography_font_family: 'Arial',
			} );

			assert.equal( data.title, 'test' );
		} );

		QUnit.test( 'create', async ( assert ) => {
			// TODO: When creating its does not care about which data you pass into create.
			const result = await $e.data.create( 'globals/typography' );

			assert.equal( result.data.id, 'fcf2ddc' );
			assert.equal( result.data.title, 'test' );
			assert.deepEqual( result.data.value, {
				typography_typography: 'custom',
				typography_font_family: 'Arial',
			} );
		} );
	} );
};

export default Typography;
