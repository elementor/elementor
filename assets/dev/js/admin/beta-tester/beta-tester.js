import BetaTesterLayout from './layout';

class BetaTesterModule extends elementorModules.ViewModule {
	onInit() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );
		if ( elementorAdmin.config.user.introduction.beta_tester_signup ) {
			return;
		}
		this.showLayout();
	}

	showLayout() {
		this.layout = new BetaTesterLayout();
		this.layout.showModal();
	}

	getDefaultSettings() {
		return {
			selectors: {
				betaTesterFirstToKnow: '#beta-tester-first-to-know',
			},
		};
	}

	getDefaultElements() {
		const elements = {};
		const selectors = this.getSettings( 'selectors' );

		elements.$betaTesterFirstToKnow = jQuery( selectors.betaTesterFirstToKnow );

		return elements;
	}

	bindEvents() {
		const elements = this.elements;

		elements.$betaTesterFirstToKnow.on( 'click', this.showLayout.bind( this ) );
	}
}

jQuery( function() {
	window.elementorBetaTester = new BetaTesterModule();
} );
