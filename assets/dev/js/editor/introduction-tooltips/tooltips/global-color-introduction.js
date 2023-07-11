export default class GlobalColorIntroduction {
	introductionKey;

	constructor( introductionKey ) {
		this.introductionKey = introductionKey;
	}

	bindEvent() {
		window.addEventListener( 'elementor/color-picker/show', ( e ) => {
			// Prevent from the tooltip to appear when the event is being triggerred from the site-settings.
			if ( 'kit' === elementor.documents.getCurrent().config.type ) {
				return;
			}

			if ( e?.detail?.el ) {
				this.tooltip.show( e.detail.el );
				this.tooltip.setViewed();
			}
		} );
	}

	initTooltip() {
		this.tooltip = new elementorModules.editor.utils.Introduction( {
			introductionKey: this.introductionKey,
			dialogType: 'tooltip',
			dialogOptions: {
				headerMessage: __( 'Check out Global Colors', 'elementor' ),
				message: sprintf(
					// eslint-disable-next-line @wordpress/i18n-translator-comments
					__( 'Save time by applying Global Colors to change the style of multiple elements at once. Click %s to see what Global Colors you already have.', 'elementor' ),
					"<i class='eicon-globe'></i>",
				),
				position: {
					my: ( elementorCommon.config.isRTL ? 'left' : 'right' ) + '0 top0',
					at: ( elementorCommon.config.isRTL ? 'left' : 'right' ) + ' top-10',
				},
				hide: {
					onOutsideClick: false,
					onBackgroundClick: false,
					onEscKeyPress: false,
				},
			},
		} );

		this.tooltip.getDialog().addButton( {
			name: 'action',
			text: __( 'Got it!', 'elementor' ),
			classes: 'elementor-button e-brand',
			callback: () => this.tooltip.getDialog().hide(),
		} );
	}
}
