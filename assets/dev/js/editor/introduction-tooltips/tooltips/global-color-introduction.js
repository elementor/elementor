export default class GlobalColorIntroduction {
	introductionKey;

	constructor( introductionKey ) {
		this.introductionKey = introductionKey;
	}

	bindEvent() {
		$e.routes.on( 'run:after', ( component, route, args ) => {
			// Prevent the Tooltip from appearing when the event is triggered from site-settings.
			if ( ! $e.routes.isPartOf( 'panel/editor' ) ) {
				return;
			}

			const controlView = this.getControlView( args.activeControl );
			if ( 'color' !== controlView?.model?.attributes?.type ) {
				return;
			}

			this.tooltip.show( controlView.el );
			this.tooltip.setViewed();
		} );
	}

	getControlView( control ) {
		if ( ! control ) {
			return null;
		}

		const editor = elementor.getPanelView().getCurrentPageView();
		const currentView = editor.content ? editor.content.currentView : editor;

		return $e.components.get( 'panel' ).getControlViewByPath( currentView, control );
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
			classes: 'elementor-button e-primary',
			callback: () => this.tooltip.getDialog().hide(),
		} );
	}
}
