import * as eData from 'elementor-tests-qunit/mock/e-data';

export const Colors = () => {
	QUnit.module( 'Colors', ( hooks ) => {
		hooks.before( () => {
			$e.data.cache.storage.clear();
			eData.addMock( 'create', 'globals/colors' );
			eData.attachMock();
		} );

		hooks.after( () => {
			eData.clearMock();
		} );

		QUnit.test( 'get', async ( assert ) => {
			const data = { test: true };

			$e.data.setCache( $e.components.get( 'globals' ), 'globals/colors', {}, data );

			eData.attachCache();

			const resultId = await $e.data.get( 'globals/colors?id=test' ),
				resultAll = await $e.data.get( 'globals/colors' );

			eData.attachMock(); // Back to default.

			assert.equal( resultId.data, true );
			assert.deepEqual( resultAll.data, data );
		} );

		QUnit.test( 'create', async ( assert ) => {
			const result = await $e.data.create( 'globals/colors', { test: true } );

			assert.equal( result.data.test, true );
		} );
	} );
};

export default Colors;
