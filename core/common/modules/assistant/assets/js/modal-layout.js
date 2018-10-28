import BaseModalLayout from '../../../../assets/js/views/modal/layout';
import ModalContent from './modal-content';

export default class extends BaseModalLayout {
	getModalOptions() {
		return {
			id: 'elementor-assistant__modal',
			draggable: true,
			position: {
				enable: false,
			},
		};
	}

	getLogoOptions() {
		return {
			title: elementorCommon.translate( 'assistant', 'assistant' ),
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
