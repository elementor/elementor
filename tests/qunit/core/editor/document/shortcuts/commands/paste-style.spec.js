import DocumentHelper from '../../helper';
import CommonHelper from '../../../../common/helper';

export const PasteStyle = () => {
	QUnit.test( 'PasteStyle', ( assert ) => {
		elementorCommon.storage.set( 'clipboard', '' );

		const eSimpleButton = DocumentHelper.createAutoButton(),
			eStyleButton = DocumentHelper.createAutoButtonStyled();

		DocumentHelper.copy( eStyleButton );

		elementor.channels.editor.reply( 'contextMenu:targetView', eSimpleButton.view );

		CommonHelper.runShortcut( 86 /* v */, true, true );

		const done = assert.async();

		setTimeout( () => {
			assert.equal( eSimpleButton.settings.get( 'background_color' ),
				eSimpleButton.settings.get( 'background_color' ),
				'Style was successfully pasted.' );

			done();
		} );
	} );
};

export default PasteStyle;
