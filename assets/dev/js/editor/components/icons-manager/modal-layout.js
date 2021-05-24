import BaseModalLayout from 'elementor-common/views/modal/layout';

export default class extends BaseModalLayout {
	getModalOptions() {
		return {
			id: 'elementor-icons-manager-modal',
		};
	}

	getLogoOptions() {
		return {
			title: __( 'Icon Library', 'elementor' ),
		};
	}

	initialize( ...args ) {
		super.initialize( ...args );

		this.showLogo();
	}
}
