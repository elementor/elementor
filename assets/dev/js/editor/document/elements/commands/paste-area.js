export class PasteArea extends $e.modules.editor.document.CommandHistoryBase {

	static dialog = null;

	getHistory( args ) {
		return false;
	}

	getDialog() {
		if ( this.dialog ) {
			return this.dialog;
		}

		const $inputArea = jQuery( '<input>', {
			id: 'elementor-paste-area-dialog__input',
			type: 'text',
			placeholder: __( 'Paste your JSON data here', 'elementor' ),
		} )
			.attr( 'autocomplete', 'off' )
			.on( 'paste', ( event ) => {
				event.preventDefault();

				const retVal = $e.run( 'document/ui/paste', {
					container: elementor.getPreviewContainer(),
					storageType: 'rawdata',
					data: event.originalEvent.clipboardData.getData( 'text' ),
					options: {
						//at: this.getOption( 'at' ),
						rebuild: true,
					},
				} );

				if ( retVal ) {
					this.dialog.hide();
					return;
				}

				$errorArea.show();
			} );

		const $errorArea = jQuery( '<div>', {
			id: 'elementor-paste-area-dialog__error',
			style: `display: none`,
		} )
			.html( __( 'Invalid JSON data', 'elementor' ) );

		this.dialog = elementorCommon.dialogsManager.createWidget( 'lightbox', {
			id: 'elementor-paste-area-dialog',
			headerMessage: __( 'Paste Area', 'elementor' ),
			message: $inputArea,
			position: {
				my: 'center center',
				at: 'center center',
			},
			closeButton: true,
			closeButtonOptions: {
				iconClass: 'eicon-close',
			},
			onShow: function() {
				$inputArea.after( $errorArea );
			},
		} );

		return this.dialog;
	}

	apply( args ) {
		this.getDialog().show();
	}
}

export default PasteArea;
