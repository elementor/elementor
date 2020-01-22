import CommandBase from 'elementor-api/modules/command-base';

export class Close extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	async apply( args ) {
		const { id, mode, onClose } = args,
			document = elementor.documents.get( id );

		// Already closed.
		if ( 'closed' === document.editor.status ) {
			return;
		}

		// TODO: Move to an hook.
		if ( ! mode && elementor.saver.isEditorChanged() ) {
			this.getConfirmDialog().show();
			return;
		}

		switch ( mode ) {
			case 'save':
				await $e.run( 'document/save/update' );
				break;
			case 'discard':
				await $e.run( 'document/save/discard', { document } );
				break;
		}

		elementor.unloadDocument( document );

		if ( onClose ) {
			onClose( document );
		}
	}

	getConfirmDialog() {
		if ( this.confirmDialog ) {
			return this.confirmDialog;
		}

		this.confirmDialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'elementor-document-save-on-close',
			headerMessage: elementor.translate( 'Save Changes' ),
			message: elementor.translate( 'Would you like to save the changes you\'ve made?' ),
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				confirm: elementor.translate( 'Save' ),
				cancel: elementor.translate( 'Discard' ),
			},
			onConfirm: () => {
				this.args.mode = 'save';

				// Re-run with same args.
				$e.run( 'editor/documents/close', this.args );
			},
			onCancel: () => {
				this.args.mode = 'discard';

				// Re-run with same args.
				$e.run( 'editor/documents/close', this.args );
			},
		} );

		return this.confirmDialog;
	}
}

export default Close;
