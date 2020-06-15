import * as eData from 'elementor-tests-qunit/mock/e-data';

export const Colors = () => {
	QUnit.module( 'Colors', ( hooks ) => {
		hooks.before( () => {
			$e.data.cache.storage.clear();
			eData.mockAdd( 'create', 'globals/colors' );
			eData.mock();
		} );

		hooks.after( () => {
			eData.mockClear();
			eData.silence();
		} );

		QUnit.test( 'get', async ( assert ) => {
			const data = { test: true };

			$e.data.setCache( $e.components.get( 'globals' ), 'globals/colors', {}, data );

			eData.cache();

			const resultId = await $e.data.get( 'globals/colors?id=test' ),
				resultAll = await $e.data.get( 'globals/colors' );

			eData.mock(); // Back to default.

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
