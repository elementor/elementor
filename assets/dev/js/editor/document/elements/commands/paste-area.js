export class PasteArea extends $e.modules.editor.document.CommandHistoryBase {

	static dialog = null;

	getHistory( args ) {
		return false;
	}

	getDialog() {
		if ( this.dialog ) {
			return this.dialog;
		}

		this.dialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'elementor-paste-area-dialog',
			headerMessage: __( 'Paste Area', 'elementor' ),
			message: '<input type="text" id="elementor-paste-area-dialog__input" placeholder="Paste Area" />',
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				cancel: __( 'Cancel', 'elementor' ),
			},
			onShow: () => {
				const $input = jQuery( '#elementor-paste-area-dialog__input' );

				$input.on( 'paste', ( event ) => {
					event.preventDefault();

					this.dialog.hide();

					$e.run( 'document/ui/paste', {
						container: elementor.getPreviewContainer(),
						storageType: 'rawdata',
						data: event.originalEvent.clipboardData.getData( 'text' ),
						options: {
							//at: this.getOption( 'at' ),
							rebuild: true,
						},
					} );
				} );
			},
		} );

		return this.dialog;
	}

	apply( args ) {
		this.getDialog().show();
	}
}

export default PasteArea;
