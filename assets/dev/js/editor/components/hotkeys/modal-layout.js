import ModalContent from './modal-content';

export default class extends elementorModules.common.views.modal.Layout {
	getModalOptions() {
		return {
			id: 'elementor-hotkeys__modal',
		};
	}

	getLogoOptions() {
		return {
			title: __( 'Keyboard Shortcuts', 'elementor' ),
		};
	}

	initialize( ...args ) {
		super.initialize( ...args );

		this.showLogo();

		this.showContentView();
	}

	showContentView() {
		this.modalContent.show( new ModalContent() );
	}
}
