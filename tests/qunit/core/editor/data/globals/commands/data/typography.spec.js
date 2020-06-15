import * as eData from 'elementor-tests-qunit/mock/e-data';

export const Typography = () => {
	QUnit.module( 'Typography', ( hooks ) => {
		hooks.before( () => {
			eData.mockAdd( 'create', 'globals/typography' );
			eData.mock();
		} );

		hooks.after( () => {
			eData.mockClear();
			eData.free();
		} );

		QUnit.test( 'get', async ( assert ) => {
			const data = { test: true };

			$e.data.setCache( $e.components.get( 'globals' ), 'globals/typography', {}, data );

			eData.cache();

			const resultId = await $e.data.get( 'globals/typography?id=test' ),
				resultAll = await $e.data.get( 'globals/typography' );

			eData.mock(); // Back to default.

			assert.equal( resultId.data, true );
			assert.deepEqual( resultAll.data, data );
		} );

		QUnit.test( 'create', async ( assert ) => {
			const result = await $e.data.create( 'globals/typography', { test: true } );

			assert.equal( result.data.test, true );
		} );
	} );
};

export default Typography;
