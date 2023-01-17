import environment from 'elementor-common/utils/environment';

export class PasteArea extends $e.modules.editor.document.CommandHistoryBase {
	static dialog = null;

	getHistory( args ) {
		return false;
	}

	getDialog() {
		if ( this.dialog ) {
			return this.dialog;
		}

		const ctrlLabel = environment.mac ? 'Cmd' : 'Ctrl';

		const $messageContainer = jQuery( '<div>', {
			class: 'e-dialog-description',
		} )
			.html( `Click the text field and press (${ ctrlLabel } + v) to paste the element into your site.` );

		const $inputArea = jQuery( '<input>', {
			id: 'elementor-paste-area-dialog__input',
			type: 'text',
			placeholder: __( 'Paste here...', 'elementor' ),
		} )
			.attr( 'autocomplete', 'off' )
			.on( 'keypress', ( event ) => {
				event.preventDefault();
			} )
			.on( 'paste', ( event ) => {
				event.preventDefault();

				const retVal = $e.run( 'document/ui/paste', {
					container: elementor.getPreviewContainer(),
					storageType: 'rawdata',
					data: event.originalEvent.clipboardData.getData( 'text' ),
					options: {
						// TODO: at: this.getOption( 'at' ),
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
			.html( __( "Couldn't paste that into your site. Copy the correct element and try again.", 'elementor' ) );

		$messageContainer
			.append( $inputArea )
			.append( $errorArea );

		this.dialog = elementorCommon.dialogsManager.createWidget( 'lightbox', {
			id: 'elementor-paste-area-dialog',
			headerMessage: __( 'Paste from other site', 'elementor' ),
			message: $messageContainer,
			position: {
				my: 'center center',
				at: 'center center',
			},
			closeButton: true,
			closeButtonOptions: {
				iconClass: 'eicon-close',
			},
			onShow: () => {
				$inputArea.focus();
			},
		} );

		return this.dialog;
	}

	apply( args ) {
		this.getDialog().show();
	}
}

export default PasteArea;
