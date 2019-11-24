import DocumentHelper from '../../helper';
import CommonHelper from '../../../../common/helper';

export const Duplicate = () => {
	QUnit.test( 'Duplicate', ( assert ) => {
		const eButton = DocumentHelper.createAutoButton();

		elementor.channels.editor.reply( 'contextMenu:targetView', eButton.view );

		CommonHelper.runShortcut( { which: 68 /* d */, ctrlKey: true, metaKey: true } );

		// Check
		assert.equal( elementor.elements.at( -1 ).get( 'elements' ).at( 0 ).get( 'elements' ).length, 2,
			'Element were duplicated.' );
	} );
};

export default Duplicate;
