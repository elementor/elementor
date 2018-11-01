import BaseModalLayout from '../../../../../../core/common/assets/js/views/modal/layout';
import ModalContent from './modal-content';

export default class extends BaseModalLayout {
	getModalOptions() {
		return {
			id: 'elementor-hotkeys__modal',
		};
	}

	getLogoOptions() {
		return {
			title: elementor.translate( 'keyboard_shortcuts' ),
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
