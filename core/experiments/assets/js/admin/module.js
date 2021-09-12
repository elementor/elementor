export default class ExperimentsModule extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				experimentIndicators: '.e-experiment__title__indicator',
				experimentForm: '#elementor-settings-form[action="options.php#tab-experiments"]',
				experimentSelects: '.e-experiment__select',
				experimentsButtons: '.e-experiment__button',
			},
		};
	}

	getDefaultElements() {
		const { selectors } = this.getSettings();

		return {
			$experimentIndicators: jQuery( selectors.experimentIndicators ),
			$experimentForm: jQuery( selectors.experimentForm ),
			$experimentSelects: jQuery( selectors.experimentSelects ),
			$experimentsButtons: jQuery( selectors.experimentsButtons ),
		};
	}

	bindEvents() {
		this.elements.$experimentForm.on( 'submit', ( event ) => this.onSettingsSubmit( event ) );
    }

	onSettingsSubmit( event ) {
		const submitButton = jQuery( event.originalEvent.submitter );

		if ( submitButton.is( this.elements.$experimentsButtons ) ) {
			this.elements.$experimentSelects.val( submitButton.val() );
		}
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
