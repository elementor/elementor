export default class extends elementorModules.Module {
	constructor() {
		super();

		this.initDialog();
	}

	initDialog() {
		this.dialog = elementor.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-element--promotion__dialog',
			effects: {
				show: 'show',
				hide: 'hide',
			},
			hide: {
				onOutsideClick: false,
			},
			position: {
				my: ( elementorCommon.config.isRTL ? 'right' : 'left' ) + '+5 top',
			},
		} );

		this.dialog.addButton( {
			name: 'action',
			text: elementor.helpers.hasPro() ? __( 'Connect & Activate', 'elementor' ) : __( 'See it in Action', 'elementor' ),
			callback: () => {
				open( this.actionURL, '_blank' );
			},
		} );

		this.dialog.getElements( 'action' ).addClass( 'elementor-button elementor-button-success' );

		const $promotionTitle = jQuery( '<div>', { id: 'elementor-element--promotion__dialog__title' } ),
			$proIcon = jQuery( '<i>', { class: 'eicon-pro-icon' } ),
			$closeButton = jQuery( '<i>', { class: 'eicon-close' } );

		$closeButton.on( 'click', () => this.dialog.hide() );

		this.dialog.getElements( 'header' ).append( $promotionTitle, $proIcon, $closeButton );

		this.$promotionTitle = $promotionTitle;
	}

	showDialog( options ) {
		if ( ! this.dialog ) {
			this.initDialog();
		}

		this.actionURL = options.actionURL;

		this.$promotionTitle.text( options.headerMessage );

		this.dialog
			.setMessage( options.message )
			.setSettings( 'position', {
				of: options.element,
				at: ( elementorCommon.config.isRTL ? 'left' : 'right' ) + ' top' + options.top,
			} );

		return this.dialog.show();
	}
}
