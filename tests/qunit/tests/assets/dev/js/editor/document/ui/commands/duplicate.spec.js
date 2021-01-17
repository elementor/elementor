import CommonHelper from 'elementor/tests/qunit/tests/core/common/helper';
import ElementsHelper from '../../elements/helper';

export const Duplicate = () => {
	QUnit.test( 'Duplicate', ( assert ) => {
		const eButton = ElementsHelper.createAutoButton();

		elementor.channels.editor.reply( 'contextMenu:targetView', eButton.view );

		CommonHelper.runShortcut( 68 /* d */, true );

		// Check
		assert.equal( elementor.elements.at( -1 ).get( 'elements' ).at( 0 ).get( 'elements' ).length, 2,
			'Element were duplicated.' );
	} );
};

export default Duplicate;
