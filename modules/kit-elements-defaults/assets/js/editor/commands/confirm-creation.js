import { getConfirmCreationDialog } from '../confirm-creation-dialog';

export default class ConfirmCreation extends $e.modules.editor.CommandContainerBase {
	validateArgs() {
		this.requireContainer();
	}

	async apply( { container } ) {
		const confirmCreationDialog = getConfirmCreationDialog( {
			onConfirm: () => $e.run( 'kit-elements-defaults/create', { container } ),
		} );

		if ( confirmCreationDialog.doNotShowAgain ) {
			$e.run( 'kit-elements-defaults/create', { container } );

			return;
		}

		confirmCreationDialog.show();
	}
}
