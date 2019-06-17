import BaseModalLayout from '../../../../../../core/common/assets/js/views/modal/layout';
import ModalContent from './modal-content';

export default class extends BaseModalLayout {
	getModalOptions() {
		return {
			id: 'elementor-icons-manager__modal',
		};
	}

	getLogoOptions() {
		return {
			title: elementor.translate( 'icon manager' ),
		};
	}

	initialize( ...args ) {
		super.initialize( ...args );

		this.showLogo();
		this.showContentView();
	}

	showModal( options ) {
		this.modal.setSettings( 'controlView', options.view );
		super.showModal();
	}

	showContentView() {
		this.modalContent.show( new ModalContent() );
	}
}
