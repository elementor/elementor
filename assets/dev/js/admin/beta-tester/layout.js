import BetaTesterView from './view';

export default class BetaTesterLayout extends elementorModules.common.views.modal.Layout {
	ui() {
		return {
			closeModal: '.elementor-templates-modal__header__close',
		};
	}

	events() {
		return {
			'click @ui.closeModal': this.onCloseModalClick,
		};
	}

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

	onCloseModalClick() {
		elementorCommon.ajax.addRequest( 'introduction_viewed', {
			data: {
				introductionKey: elementorAdmin.config.beta_tester_newsletter,
			},
		} );
	}
}
