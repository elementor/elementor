class Counter extends elementorModules.frontend.handlers.Base {
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

		elementorFrontend.waypoint( this.elements.$counterNumber, function() {
			var $number = jQuery( this ),
				data = $number.data();

			var decimalDigits = data.toValue.toString().match( /\.(.*)/ );

			if ( decimalDigits ) {
				data.rounding = decimalDigits[ 1 ].length;
			}

			$number.numerator( data );
		} );
	}
}

export default ( $scope ) => {
	elementorFrontend.elementsHandler.addHandler( Counter, {
		$element: $scope,
	} );
};
