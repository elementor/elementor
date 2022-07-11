export default class extends elementorModules.Module {
	actionButtonConfig;

	constructor() {
		super();

		this.initActionButtonConfig();
		this.initDialog();
	}

	initActionButtonConfig() {
		// We also need to check if the 'connect' URL exist for not breaking older pro versions that does not contain this link.
		const isProExistNotConnected = ! ! ( elementor.helpers.hasPro() && elementorProEditorConfig.urls.connect );

		// `isProExistNotConnected` is for BC.
		this.setActionButtonConfig( {
			text: isProExistNotConnected ? __( 'Connect & Activate', 'elementor' ) : __( 'See it in Action', 'elementor' ),
			url: isProExistNotConnected ? elementorProEditorConfig.urls.connect : null,
		} );
	}

	setActionButtonConfig( { text, url } ) {
		this.actionButtonConfig = { text, url };
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

		const $promotionTitle = jQuery( '<div>', { id: 'elementor-element--promotion__dialog__title' } ),
			$proIcon = jQuery( '<i>', { class: 'eicon-pro-icon' } ),
			$closeButton = jQuery( '<i>', { class: 'eicon-close' } );

		$closeButton.on( 'click', () => this.dialog.hide() );

		this.dialog.getElements( 'header' ).append( $promotionTitle, $proIcon, $closeButton );

		this.$promotionTitle = $promotionTitle;
	}

	createActionButton( actionURL ) {
		const $actionButton = this.dialog.getElements( 'action' );

		if ( $actionButton ) {
			$actionButton.remove();
		}

		this.dialog.addButton( {
			name: 'action',
			text: this.actionButtonConfig.text,
			classes: 'elementor-button elementor-button-success',
			callback: () => {
				open( this.actionButtonConfig.url || actionURL, '_blank' );
			},
		} );
	}

	showDialog( options ) {
		if ( ! this.dialog ) {
			this.initDialog();
		}

		this.$promotionTitle.text( options.headerMessage );

		this.createActionButton( options.actionURL );

		this.dialog
			.setMessage( options.message )
			.setSettings( 'position', {
				of: options.element,
				at: ( elementorCommon.config.isRTL ? 'left' : 'right' ) + ( options.inlineStart || '' ) + ' top' + options.top,
			} );

		return this.dialog.show();
	}
}
