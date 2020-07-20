import ElementsHelper from 'elementor-tests-qunit/core/editor/document/elements/helper';
import * as eData from 'elementor-tests-qunit/mock/e-data';

export const Create = () => {
	QUnit.module( 'Create', ( hooks ) => {
		let prevMock = false;

		hooks.before( () => {
			prevMock = eData.removeMock( 'create', 'globals/typography' );

			// Default addMock callback is return args.data merged with args.query.
			eData.addMock( 'create', 'globals/typography' );
			eData.attachMock();

			$e.data.cache.storage.clear();
		} );

		hooks.after( () => {
			const { type, command, callback } = prevMock;

			// Remove what was set locally.
			eData.removeMock( type, command );

			// Set back what was before.
			eData.addMock( type, command, callback );
		} );

		QUnit.test( 'Simple', async ( assert ) => {
			// Create widget.
			const eButton = ElementsHelper.createAutoButton(),
				id = elementorCommon.helpers.getUniqueId(),
				title = 'title_' + id;

			ElementsHelper.settings( eButton, {
				typography_text_transform: 'uppercase',
			} );

			const result = await $e.run( 'globals/typography/create', {
				id,
				container: eButton,
				setting: 'typography_typography',
				title,
			} );

			assert.equal( result.data.title, title );
			assert.equal( result.data.value.typography_text_transform, 'uppercase' );
		} );
	} );
};
