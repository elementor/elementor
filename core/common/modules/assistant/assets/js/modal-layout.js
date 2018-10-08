const BaseModalLayout = require( 'elementor-templates/views/base-modal-layout' );

import ModalContent from './modal-content';

export default class extends BaseModalLayout {
	getModalOptions() {
		return {
			id: 'elementor-assistant__modal',
		};
	}

	getLogoOptions() {
		return {
			title: elementorCommon.translate( 'assistant', 'assistant' ),
		};
	}

	getHeaderOptions() {
		return {
			closeType: false,
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

	showModal( ...args ) {
		super.showModal( ...args );

		this.modalContent.currentView.ui.searchInput.focus();
	}
}
