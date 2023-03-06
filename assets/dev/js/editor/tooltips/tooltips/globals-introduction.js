export default class GlobalsIntroduction {
	introductionKey = 'globals_introduction_tooltip';
	introductionViewed = elementor.config.user.introduction[ this.introductionKey ] ?? false;

	constructor() {
		if ( ! this.introductionViewed ) {
			this.initTooltip();
			this.bindEvent();
		}
	}

	bindEvent() {
		window.addEventListener( 'elementor/color-picker/show', ( e ) => {
			// Prevent from the tooltip to appear when the event is being triggerred from the site-settings.
			if ( elementor.documents.getCurrent().config.type === 'kit' ) {
				return;
			}

			if ( e.detail.el ) {
				this.setTooltipTitle( __( 'Great choice! Planning to use it again?', 'elementor' ) );
				this.setTooltipContent( __(
					'Save time by applying Global Colors to change the style of multiple elements at once. Click  to see what Global Colors you already have.',
					'elementor',
				) );
				this.showTooltip( e.detail.el );
				this.setViewed();
			}
		} );

		window.addEventListener( 'elementor/popover/show', ( e ) => {
			// Prevent from the tooltip to appear when the event is being triggerred from the site-settings.
			if ( elementor.documents.getCurrent().config.type === 'kit' ) {
				return;
			}

			let $popoverElement = null;

			if ( e.detail.el.hasClass( 'elementor-control-typography_typography' ) ) {
				$popoverElement = e.detail.el;
			}

			if ( $popoverElement ) {
				this.setTooltipTitle( __( 'Check out Global Fonts', 'elementor' ) );
				this.setTooltipContent( __(
					'Save time by applying Global Fonts to change the style of multiple elements at once. Click  to see what Global Fonts you already have. ',
					'elementor',
				) );

				this.showTooltip( $popoverElement );
				this.setViewed();
			}
		} );
	}

	initTooltip() {
		this.tooltip = new elementorModules.editor.utils.Tooltip( {
			introductionKey: this.introductionKey,
			dialogType: 'tooltip',
			dialogOptions: {},
		} );

		const buttonOptions = {
			text: __( 'Got it!', 'elementor' ),
			classes: [ 'elementor-button', 'e-brand' ],
		};

		this.setTooltipButton( buttonOptions );
	}

	setTooltipTitle( title ) {
		this.tooltip.setTitle( title );
	}

	setTooltipContent( content ) {
		this.tooltip.setContent( content );
	}

	setTooltipButton( button ) {
		this.tooltip.setButton( button );
	}

	showTooltip( element ) {
		if ( this.introductionViewed ) {
			return;
		}

		this.tooltip.show( {
			targetElement: element,
			position: {
				blockStart: '-10',
			},
		} );
	}

	setViewed() {
		this.introductionViewed = true;
		this.tooltip.setViewed();
	}
}
