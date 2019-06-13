import BetaTesterView from './view';

export default class BetaTesterLayout extends elementorModules.common.views.modal.Layout {
	getModalOptions() {
		return {
			id: 'elementor-beta-tester-modal',
		};
	}

	getLogoOptions() {
		return {
			title: elementorAdmin.translate( 'beta_tester_sign_up' ),
		};
	}

	initialize() {
		elementorModules.common.views.modal.Layout.prototype.initialize.apply( this, arguments );

		this.showLogo();

		this.showContentView();
	}

	showContentView() {
		this.modalContent.show( new BetaTesterView() );
	}
}
