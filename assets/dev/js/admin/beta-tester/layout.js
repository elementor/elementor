import BetaTesterView from './view';

export default class BetaTesterLayout extends elementorModules.common.views.modal.Layout {
	ui() {
		return {
			closeModal: '.elementor-templates-modal__header__close',
			dontShowAgain: '.elementor-beta-tester-do-not-show-again',
		};
	}

	events() {
		return {
			'click @ui.closeModal': this.onCloseModalClick,
			'click @ui.dontShowAgain': this.onDontShowAgainClick,
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

		const doNotShowAgain = elementorAdmin.translate( 'do_not_show_again' );

		this.modalHeader.currentView.ui.closeModal.after( jQuery( '<div>', { class: 'elementor-beta-tester-do-not-show-again' } ).text( doNotShowAgain ) );
	}

	showContentView() {
		this.modalContent.show( new BetaTesterView() );
	}

	onDontShowAgainClick() {
		this.hideModal();
		this.onCloseModalClick();
	}

	onCloseModalClick() {
		elementorCommon.ajax.addRequest( 'introduction_viewed', {
			data: {
				introductionKey: elementorAdmin.config.beta_tester_signup,
			},
		} );
	}
}
