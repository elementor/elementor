export default class PromotionBehavior extends Marionette.Behavior {
	ui() {
		return {
			displayConditionsButton: '.eicon-flow.e-control-display-conditions',
		};
	}

	events() {
		return {
			'click @ui.displayConditionsButton': 'onClickControlButtonDisplayConditions',
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
			targetElement: event.target,
			position: {
				blockStart: '-10',
			},
			actionButton: {
				url: 'https://go.elementor.com/go-pro-display-conditions/',
				text: __( 'Upgrade Now', 'elementor' ),
			},
		};

		elementor.promotion.showDialog( dialogOptions );
	}
}
