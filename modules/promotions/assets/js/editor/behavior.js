export default class PromotionBehavior extends Marionette.Behavior {
	ui() {
		return {
			displayConditionsButton: '.eicon-flow.e-control-display-conditions-promotion',
			scrollingEffectsButton: '.e-control-scrolling-effects-promotion',
			mouseEffectsButton: '.e-control-mouse-effects-promotion',
			stickyEffectsButton: '.e-control-sticky-effects-promotion',
		};
	}

	events() {
		return {
			'click @ui.displayConditionsButton': 'onClickControlButtonDisplayConditions',
			'click @ui.scrollingEffectsButton': 'onClickControlButtonScrollingEffects',
			'click @ui.mouseEffectsButton': 'onClickControlButtonMouseEffects',
			'click @ui.stickyEffectsButton': 'onClickControlButtonStickyEffects',
		};
	}

	dispatchPromotionEvent( widgetType, promotion ) {
		document.dispatchEvent( new CustomEvent( 'widget-promotion:open', {
			detail: {
				target: this.el,
				widgetType,
				...promotion,
			},
		} ) );
	}

	onClickControlButtonDisplayConditions( event ) {
		event.stopPropagation();

		this.dispatchPromotionEvent( 'displayConditions', {
			title: __( 'Display Conditions', 'elementor' ),
			content: __(
				'Upgrade to Elementor Pro Advanced to get the Display Conditions Feature as well as additional professional and ecommerce widgets',
				'elementor',
			),
			ctaUrl: 'https://go.elementor.com/go-pro-display-conditions/',
		} );
	}

	onClickControlButtonScrollingEffects( event ) {
		event.stopPropagation();

		this.dispatchPromotionEvent( 'scrollingEffects', {
			title: __( 'Scrolling Effects', 'elementor' ),
			content: __(
				'Get Scrolling Effects such as vertical/horizontal scroll, transparency, and more with Elementor Pro.',
				'elementor',
			),
			ctaUrl: 'https://go.elementor.com/go-pro-scrolling-effects-advanced/',
		} );
	}

	onClickControlButtonMouseEffects( event ) {
		event.stopPropagation();

		this.dispatchPromotionEvent( 'mouseEffects', {
			title: __( 'Mouse Effects', 'elementor' ),
			content: __(
				'Add a Mouse Track or 3d Tilt effect with Elementor Pro.',
				'elementor',
			),
			ctaUrl: 'https://go.elementor.com/go-pro-motion-effects-advanced/',
		} );
	}

	onClickControlButtonStickyEffects( event ) {
		event.stopPropagation();

		this.dispatchPromotionEvent( 'sticky', {
			title: __( 'Sticky', 'elementor' ),
			content: __(
				'Make any element on your page sticky and keep them in sight at the top or bottom of the screen.',
				'elementor',
			),
			ctaUrl: 'https://go.elementor.com/go-pro-sticky-element-advanced/',
		} );
	}
}
