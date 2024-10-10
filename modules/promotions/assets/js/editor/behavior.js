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

	onClickControlButtonDisplayConditions( event ) {
		event.stopPropagation();

		const dialogOptions = {
			title: __( 'Display Conditions', 'elementor' ),
			content: __(
				'Upgrade to Elementor Pro Advanced to get the Display Conditions Feature as well as additional professional and ecommerce widgets',
				'elementor',
			),
			targetElement: this.el,
			actionButton: {
				url: 'https://go.elementor.com/go-pro-display-conditions/',
				text: __( 'Upgrade Now', 'elementor' ),
			},
		};

		elementor.promotion.showDialog( dialogOptions );
	}

	onClickControlButtonScrollingEffects( event ) {
		event.stopPropagation();

		const dialogOptions = {
			title: __( 'Scrolling Effects', 'elementor' ),
			content: __(
				'Get Scrolling Effects such as <br /> vertical/horizontal scroll, transparency,<br /> and more with Elementor Pro.',
				'elementor',
			),
			targetElement: this.el,
			actionButton: {
				url: 'https://go.elementor.com/go-pro-scrolling-effects-advanced/',
				text: __( 'Upgrade Now', 'elementor' ),
			},
		};

		elementor.promotion.showDialog( dialogOptions );
	}

	onClickControlButtonMouseEffects( event ) {
		event.stopPropagation();

		const dialogOptions = {
			title: __( 'Mouse Effects', 'elementor' ),
			content: __(
				'Add a Mouse Track or 3d Tilt effect with<br />Elementor Pro.',
				'elementor',
			),
			targetElement: this.el,
			actionButton: {
				url: 'https://go.elementor.com/go-pro-motion-effects-advanced/',
				text: __( 'Upgrade Now', 'elementor' ),
			},
		};

		elementor.promotion.showDialog( dialogOptions );
	}

	onClickControlButtonStickyEffects( event ) {
		event.stopPropagation();

		const dialogOptions = {
			title: __( 'Sticky', 'elementor' ),
			content: __(
				'Make any element on your page sticky and<br />keep them in sight at the top or bottom of<br />the screen.',
				'elementor',
			),
			targetElement: this.el,
			actionButton: {
				url: 'https://go.elementor.com/go-pro-sticky-element-advanced/',
				text: __( 'Upgrade Now', 'elementor' ),
			},
		};

		elementor.promotion.showDialog( dialogOptions );
	}
}
