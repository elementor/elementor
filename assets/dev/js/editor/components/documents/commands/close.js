export class Close extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	async apply( args ) {
		const { id, mode, onClose } = args,
			document = elementor.documents.get( id );

		// Already closed.
		if ( 'closed' === document.editor.status ) {
			return jQuery.Deferred().resolve();
		}

		// TODO: Move to an hook.
		if ( ! mode && ( document.editor.isChanged || document.isDraft() ) ) {
			const deferred = jQuery.Deferred();
			this.getConfirmDialog( deferred ).show();
			return deferred.promise();
		}

		switch ( mode ) {
			case 'autosave':
				await $e.run( 'document/save/auto' );
				break;
			case 'save':
				await $e.run( 'document/save/update' );
				break;
			case 'discard':
				await $e.run( 'document/save/discard', { document } );
				break;
		}

		$e.run( 'document/elements/deselect-all' );

		await $e.internal( 'editor/documents/unload', { document } );

		if ( onClose ) {
			await onClose( document );
		}

		return jQuery.Deferred().resolve();
	}

	getConfirmDialog( deferred ) {
		if ( this.confirmDialog ) {
			return this.confirmDialog;
		}

		// Use 'lightbox' (no auto-injected buttons) but reuse the existing 'dialog-type-confirm'
		// styles in _dialog-confirm.scss for layout, spacing, and button visuals.
		this.confirmDialog = elementorCommon.dialogsManager.createWidget( 'lightbox', {
			id: 'elementor-document-save-on-close',
			className: 'dialog-type-confirm',
			headerMessage: __( 'You are leaving to a separate site part.', 'elementor' ),
			message: __( 'Save your changes before moving on because the current document and the one you’re moving to are separate site parts.', 'elementor' ),
			closeButton: true,
			position: {
				my: 'center center',
				at: 'center center',
			},
			onHide: () => {
				// If still no action chosen (X / Esc / outside click) — cancel the close.
				// Defer because onHide runs before button callbacks.
				_.defer( () => {
					if ( ! this.args.mode ) {
						window.top.$e.internal( 'panel/state-ready' );
						deferred.reject( 'Close document has been canceled.' );
					}
				} );
			},
		} );

		const reRunWithMode = ( mode ) => {
			this.args.mode = mode;

			$e.run( 'editor/documents/close', this.args )
				.then( () => {
					deferred.resolve();
				} );
		};

		// Button names map to .dialog-cancel / .dialog-ok in _dialog-confirm.scss
		// so we get the text/primary visual styles for free.
		this.confirmDialog.addButton( {
			name: 'cancel',
			text: __( 'Leave without saving', 'elementor' ),
			callback: () => reRunWithMode( 'discard' ),
		} );

		this.confirmDialog.addButton( {
			name: 'ok',
			text: __( 'Save & leave', 'elementor' ),
			focus: true,
			callback: () => reRunWithMode( 'save' ),
		} );

		return this.confirmDialog;
	}
}

export default Close;
