import DocumentHelper from '../../helper';
import CommonHelper from '../../../../common/helper';

export const Paste = () => {
	QUnit.test( 'Paste', ( assert ) => {
		const eButton = DocumentHelper.createAutoButton();

		DocumentHelper.copy( eButton );

		elementor.channels.editor.reply( 'contextMenu:targetView', elementor.getPreviewContainer().view );

		CommonHelper.runShortcut( { which: 86 /* v */, ctrlKey: true, metaKey: true } );

		const done = assert.async();

		setTimeout( () => {
			// Check.
			assert.equal( elementor.elements.at( 0 ).get( 'elements' ).at( 0 ).get( 'elements' ).length, 2,
				'Pasted element were created.' );

			done();
		}, 0 );
	} );
};

export default Paste;
