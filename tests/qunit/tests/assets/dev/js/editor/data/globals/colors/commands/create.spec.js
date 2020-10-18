import ElementsHelper from 'elementor/tests/qunit/tests/assets/dev/js/editor/document/elements/helper';
import * as eData from 'elementor/tests/qunit/mock/e-data';

export const Create = () => {
	QUnit.module( 'Create', ( hooks ) => {
		let prevMock = false;

		hooks.before( () => {
			prevMock = eData.removeMock( 'create', 'globals/colors' );

			// Default addMock callback is return args.data merged with args.query.
			eData.addMock( 'create', 'globals/colors' );
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
				random = Math.random().toString(),
				title = 'title_' + random;

			ElementsHelper.settings( eButton, {
				button_text_color: 'red',
			} );

			const result = await $e.run( 'globals/colors/create', {
				container: eButton,
				setting: 'button_text_color',
				title,
			} );

			assert.equal( result.data.title, title );
			assert.equal( result.data.value, 'red' );
		} );
	} );
};

export default Create;
