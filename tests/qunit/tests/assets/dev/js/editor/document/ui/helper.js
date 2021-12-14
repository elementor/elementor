import ElementsHelper from 'elementor/tests/utils/js/document-elements-helper.mjs';

export default class UIHelper {
	static copyPaste( source, target ) {
		ElementsHelper.copy( source );

		elementor.channels.editor.reply( 'contextMenu:targetView', target.view );

		return $e.commands.runShortcut( 'document/ui/paste',
			jQuery.Event( 'keydown', { which: 86, ctrlKey: true, metaKey: true } )
		);
	}
}
