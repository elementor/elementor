import Base from '../document/commands/base/base';

export class Close extends Base {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id, mode } = args;

		// Already closed.
		if ( 'close' === elementor.documents[ id ].editorStatus ) {
			return;
		}

		// TODO: Move to an hook.
		if ( ! mode && elementor.saver.isEditorChanged() ) {
			this.getConfirmDialog().show();
			return;
		}

		switch ( args.mode ) {
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

		elementor.documents[ id ].editorStatus = 'close';
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
				$e.run( 'editor/documents/close', {
					id: this.args.id,
					mode: 'save',
				} );
			},
			onCancel: () => {
				$e.run( 'editor/documents/close', {
					id: this.args.id,
					mode: 'discard',
				} );
			},
		} );

		return this.confirmDialog;
	}
}

export default Close;
