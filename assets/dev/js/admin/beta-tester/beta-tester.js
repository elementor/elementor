import BetaTesterLayout from './layout';

class BetaTesterModule extends elementorModules.ViewModule {
	onInit() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );
		if ( elementorAdmin.config.user.introduction.beta_tester_newsletter ) {
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
				beta_tester_first_to_know: '#beta-tester-first-to-know',
			},
		};
	}

	getDefaultElements() {
		let elements = {};
		const selectors = this.getSettings( 'selectors' );

		elements.$beta_tester_first_to_know = jQuery( selectors.beta_tester_first_to_know );

		return elements;
	}

	bindEvents() {
		const elements = this.elements;

		elements.$beta_tester_first_to_know.on( 'click', this.showLayout.bind( this ) );
	}
}

jQuery( function() {
	window.elementorBetaTester = new BetaTesterModule();
} );
