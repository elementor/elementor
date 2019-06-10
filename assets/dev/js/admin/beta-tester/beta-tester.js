import BetaTesterLayout from './layout';

class BetaTesterModule extends elementorModules.ViewModule {
	getDefaultSettings() {}

	getDefaultElements() {}

	bindEvents() {}

	onInit() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );

		this.layout = new BetaTesterLayout();
		this.layout.showModal();
	}
}

jQuery( function() {
	window.elementorBetaTester = new BetaTesterModule();
} );
