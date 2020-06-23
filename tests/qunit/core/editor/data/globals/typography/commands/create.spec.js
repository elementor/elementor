import ElementsHelper from 'elementor-tests-qunit/core/editor/document/elements/helper';
import * as eData from 'elementor-tests-qunit/mock/e-data';

export const Create = () => {
	QUnit.module( 'Create', ( hooks ) => {
		hooks.before( () => {
			$e.data.cache.storage.clear();
			eData.addMock( 'create', 'globals/typography' );
			eData.attachMock();
		} );

		hooks.after( () => {
			eData.clearMock();
		} );

		QUnit.test( 'Simple', async ( assert ) => {
			// Create widget.
			const eButton = ElementsHelper.createAutoButton(),
				random = Math.random().toString(),
				title = 'title_' + random;

			ElementsHelper.settings( eButton, {
				typography_text_transform: 'uppercase',
			} );

			const result = await $e.run( 'globals/typography/create', {
				container: eButton,
				setting: 'typography_typography',
				title,
			} );

			assert.equal( result.data.title, title );
			assert.equal( result.data.value.typography_text_transform, 'uppercase' );
		} );
	} );
};

export default Create;
