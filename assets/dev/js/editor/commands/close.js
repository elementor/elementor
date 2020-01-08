import Base from '../document/commands/base/base';

export class Close extends Base {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id, mode, onClose } = args,
			document = elementor.documents.get( id );

		// Already closed.
		if ( 'closed' === document.editorStatus ) {
			return;
		}

		// TODO: Move to an hook.
		if ( ! mode && elementor.saver.isEditorChanged() ) {
			this.getConfirmDialog().show();
			return;
		}

		switch ( mode ) {
			case 'save':
				elementor.saver.update();
				break;
			case 'discard':
				elementor.saver.discard();

				// TODO: Discard local changes.
				break;
		}

		elementor.channels.dataEditMode.trigger( 'switch', 'preview' );

		elementor.$previewContents.find( `.elementor-${ id }` )
			.removeClass( 'elementor-edit-area-active' )
			.addClass( 'elementor-edit-area-preview elementor-editor-preview' );

		elementorCommon.elements.$body.removeClass( `elementor-editor-${ document.config.type }` );

		document.editorStatus = 'closed';

		if ( onClose ) {
			onClose();
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
