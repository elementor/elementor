import NewFloatingElementsView from 'elementor-admin/floating-elements/view';
import ModalLayout from 'elementor-common/views/modal/layout';

export default class extends ModalLayout {
	getModalOptions() {
		return {
			id: 'elementor-new-floating-elements-modal',
		};
	}

	getLogoOptions() {
		return {
			title: __( 'New Floating Elements', 'elementor' ),
		};
	}

	initialize() {
		super.initialize();

		this.showLogo();

		this.showContentView();
	}

	showContentView() {
		this.modalContent.show( new NewFloatingElementsView() );
	}
}
