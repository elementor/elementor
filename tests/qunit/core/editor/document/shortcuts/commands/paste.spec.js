import DocumentHelper from '../../helper';
import CommonHelper from '../../../../common/helper';

export const Paste = () => {
	QUnit.test( 'Paste', ( assert ) => {
		elementorCommon.storage.set( 'clipboard', '' );

		const eButton = DocumentHelper.createAutoButton();

		DocumentHelper.copy( eButton );

		elementor.channels.editor.reply( 'contextMenu:targetView', elementor.getPreviewContainer().view );

		CommonHelper.runShortcut( 86 /* v */, true );

		const done = assert.async();

		setTimeout( () => {
			// Check.
			assert.equal( elementor.elements.at( 0 ).get( 'elements' ).at( 0 ).get( 'elements' ).length, 2,
				'Pasted element were created.' );

			done();
		} );
	} );
};

export default Paste;
