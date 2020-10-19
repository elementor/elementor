import * as eData from 'elementor-tests-qunit/mock/e-data';

export const Colors = () => {
	QUnit.module( 'Colors', ( hooks ) => {
		hooks.before( () => {
			eData.attachMock();
			$e.data.cache.storage.clear();
		} );

		QUnit.test( 'get', async ( assert ) => {
			const result = await $e.data.get( 'globals/colors' ),
				data = result.data[ '4521fd0' ];

			assert.equal( data.title, 'test' );
			assert.equal( data.value, 'red' );
		} );

		QUnit.test( 'create', async ( assert ) => {
			// TODO: When creating its does not care about which data you pass into create.
			const result = await $e.data.create( 'globals/colors' );

			assert.equal( result.data.title, 'test' );
			assert.equal( result.data.id, '4521fd0' );
			assert.equal( result.data.value, 'red' );
		} );
	} );
};

export default Colors;
