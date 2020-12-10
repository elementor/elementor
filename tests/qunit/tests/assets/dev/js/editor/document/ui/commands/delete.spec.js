import CommonHelper from 'elementor/tests/qunit/tests/core/common/helper';
import ElementsHelper from '../../elements/helper';

export const Delete = () => {
	QUnit.test( 'Delete', ( assert ) => {
		const eButton = ElementsHelper.createAutoButton();

		elementor.channels.editor.reply( 'contextMenu:targetView', eButton.view );

		CommonHelper.runShortcut( 46 /* Delete */ );

		const done = assert.async();

		setTimeout( () => {
			// Check.
			assert.equal( eButton.view.isDestroyed, true, 'element were deleted.' );

			done();
		} );
	} );
};

export default Delete;
