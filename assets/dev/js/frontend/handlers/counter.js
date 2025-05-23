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

		this.intersectionObserver = elementorModules.utils.Scroll.scrollObserver( {
			callback: ( event ) => {
				if ( event.isInViewport ) {
					this.intersectionObserver.unobserve( this.elements.$counterNumber[ 0 ] );

					const data = this.elements.$counterNumber.data(),
						decimalDigits = data.toValue.toString().match( /\.(.*)/ );

					if ( decimalDigits ) {
						data.rounding = decimalDigits[ 1 ].length;
					}

					this.elements.$counterNumber.numerator( data );
				}
			},
		} );

		this.intersectionObserver.observe( this.elements.$counterNumber[ 0 ] );
	}
}
