export class Back extends $e.modules.CommandBase {
	document = null;
	confirmDialog = null;
	unsavedChangesDialog = [];

	apply() {
		const panelHistory = $e.routes.getHistory( 'panel' );

		// When there's no more previous pages to navigate back to,
		// prompt the user with a confirmation dialog asking if they would like to exit.
		if ( 1 === panelHistory.length ) {
			this.getCloseConfirmDialog( event ).show();
			return;
		}

		// If the user is on the global colors/typography page, and there are unsaved changes,
		// prompt the user with a confirmation dialog asking if they would like to save the changes.
		if ( this.isGlobalRoute() ) {
			const kit = elementor.config.kit_id;
			this.document = elementor.documents.get( kit );

			if ( this.isDocumentChanged() ) {
				this.resolveChanges().then( () => {
					return $e.routes.back( 'panel' );
				} );

				return;
			}
		}

		return $e.routes.back( 'panel' );
	}

	getCloseConfirmDialog( event ) {
		if ( ! this.confirmDialog ) {
			const modalOptions = {
				id: 'elementor-kit-warn-on-close',
				headerMessage: __( 'Exit', 'elementor' ),
				message: __( 'Would you like to exit?', 'elementor' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				strings: {
					confirm: __( 'Exit', 'elementor' ),
					cancel: __( 'Cancel', 'elementor' ),
				},
				onConfirm: () => {
					$e.run( 'panel/global/close' );
				},
			};

			this.confirmDialog = elementorCommon.dialogsManager.createWidget( 'confirm', modalOptions );
		}

		this.confirmDialog.setSettings( 'hide', {
			onEscKeyPress: ! event,
		} );

		return this.confirmDialog;
	}

	isGlobalRoute() {
		const panelHistory = $e.routes.getHistory( 'panel' );

		return /global\/\bglobal-colors|global-typography\b/.test( panelHistory[ panelHistory.length - 1 ].route );
	}

	isDocumentChanged() {
		return this.document && this.document.editor.isChanged;
	}

	resolveChanges() {
		return new Promise( ( resolve ) => {
			this.getUnsavedChangesDialog( resolve ).show();
		} );
	}

	getUnsavedChangesDialog( resolve ) {
		if ( ! this.document ) {
			resolve();
			return;
		}

		const document = this.document;

		if ( ! this.unsavedChangesDialog[ document ] ) {
			const modalOptions = {
				id: `elementor-${ document }-save-changes`,
				headerMessage: __( 'Save Changes', 'elementor' ),
				message: __( 'Would you like to save the changes you\'ve made?', 'elementor' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				strings: {
					confirm: __( 'Save', 'elementor' ),
					cancel: __( 'Discard', 'elementor' ),
				},
				onConfirm: () => {
					$e.run( 'document/save/update' ).then( () => {
						resolve();
					} );
				},
				onCancel: () => {
					$e.run( 'document/save/discard', { document } ).then( () => {
						resolve();
					} );
				},
			};

			this.unsavedChangesDialog[ document ] = elementorCommon.dialogsManager.createWidget( 'confirm', modalOptions );
		}

		this.unsavedChangesDialog[ document ].setSettings( 'hide', {
			onEscKeyPress: ! event,
		} );

		return this.unsavedChangesDialog[ document ];
	}
}

export default Back;
