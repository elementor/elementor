export default class Counter extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				counterNumber: '.elementor-counter-number',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			$counterNumber: this.$element.find( selectors.counterNumber ),
		};
	}

	onInit() {
		super.onInit();

		elementorFrontend.waypoint( this.elements.$counterNumber, () => {
			const data = this.elements.$counterNumber.data(),
				decimalDigits = data.toValue.toString().match( /\.(.*)/ );

			if ( decimalDigits ) {
				data.rounding = decimalDigits[ 1 ].length;
			}

			this.elements.$counterNumber.numerator( data );
		} );
	}
}
