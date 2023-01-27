import environment from 'elementor-common/utils/environment';

export class PasteArea extends $e.modules.editor.document.CommandHistoryBase {
	static dialog = null;

	static container = null;

	static options = {};

	getHistory( args ) {
		return false;
	}

	getDialog() {
		if ( this.dialog ) {
			return this.dialog;
		}

		const $messageContainer = jQuery( '<div>', {
			class: 'e-dialog-description',
		} )
			.html( __( 'To paste the element from your other site.', 'elementor' ) );

		const $inputArea = jQuery( '<input>', {
			id: 'elementor-paste-area-dialog__input',
			type: 'text',
		} )
			.attr( 'autocomplete', 'off' )
			.on( 'keypress', ( event ) => {
				event.preventDefault();
			} )
			.on( 'blur', () => {
				_.defer( () => $inputArea.focus() );
			} )
			.on( 'paste', async ( event ) => {
				event.preventDefault();

				const $widgetContent = this.getDialog().getElements( 'widgetContent' );

				$widgetContent.addClass( 'e-state-loading' );

				const retVal = await $e.run( 'document/ui/paste', {
					container: this.container,
					storageType: 'rawdata',
					data: event.originalEvent.clipboardData.getData( 'text' ),
					options: this.options,
				} );

				$widgetContent.removeClass( 'e-state-loading' );

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
			.html( __( 'Make sure that both sites are updated to last version of Elementor and have enabled the features relevant to the copied element before trying again.', 'elementor' ) );

		const $loadingArea = jQuery( '<i>', {
			class: 'eicon-loading eicon-animation-spin',
		} );

		$messageContainer
			.append( $inputArea )
			.append( $errorArea )
			.append( $loadingArea );

		const ctrlLabel = environment.mac ? '&#8984;' : 'Ctrl';

		this.dialog = elementorCommon.dialogsManager.createWidget( 'lightbox', {
			id: 'elementor-paste-area-dialog',
			headerMessage: `${ ctrlLabel } + V`,
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

				this.getDialog().getElements( 'widgetContent' ).on( 'click', () => {
					$inputArea.focus();
				} );
			},
		} );

		return this.dialog;
	}

	apply( args ) {
		this.container = args.container;
		if ( args.options ) {
			this.options = args.options;
		}

		this.getDialog().show();
	}
}

export default PasteArea;
