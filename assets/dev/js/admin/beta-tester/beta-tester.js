import BetaTesterLayout from './layout';

class BetaTesterModule extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				betaSelect: '.elementor_beta select',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$betaSelect: jQuery( selectors.betaSelect ),
		};
	}

	bindEvents() {
		this.elements.$betaSelect.on( 'change', this.onBetaTesterSelected.bind( this ) );
	}

	onInit() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );

		this.layout = new BetaTesterLayout();
	}
	onBetaTesterSelected() {
		if ( 'yes' !== this.elements.$betaSelect.val() ) {
			return;
		}
		this.layout.showModal();
	}
}

jQuery( function() {
	window.elementorBetaTester = new BetaTesterModule();
} );
