export default class ExperimentsModule extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				experimentIndicators: '.e-experiment__title__indicator',
			},
		};
	}

	getDefaultElements() {
		return {
			$experimentIndicators: jQuery( this.getSettings( 'selectors.experimentIndicators' ) ),
		};
	}

	addTipsy( $element ) {
		$element.tipsy( {
			gravity: 's',
			offset: 8,
			title() {
				return this.getAttribute( 'data-tooltip' );
			},
		} );
	}

	addIndicatorsTooltips() {
		this.elements.$experimentIndicators.each( ( index, experimentIndicator ) => this.addTipsy( jQuery( experimentIndicator ) ) );
	}

	onInit() {
		super.onInit();

		if ( this.elements.$experimentIndicators.length ) {
			import(
				/* webpackIgnore: true */
				`${ elementorCommon.config.urls.assets }lib/tipsy/tipsy.min.js?ver=1.0.0`
				).then( () => this.addIndicatorsTooltips() );
		}
	}
}
