export default class PromotionBehavior extends Marionette.Behavior {
	ui() {
		return {
			displayConditionsButton: '.eicon-flow.e-control-display-conditions-promotion',
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
			targetElement: this.el,
			actionButton: {
				url: 'https://go.elementor.com/go-pro-display-conditions/',
				text: __( 'Upgrade Now', 'elementor' ),
			},
		};

		elementor.promotion.showDialog( dialogOptions );
	}
}
