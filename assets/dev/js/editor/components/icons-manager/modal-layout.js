import BaseModalLayout from '../../../../../../core/common/assets/js/views/modal/layout';

export default class extends BaseModalLayout {
	getModalOptions() {
		return {
			id: 'elementor-icons-manager-modal',
		};
	}

	getLogoOptions() {
		return {
			title: elementor.translate( 'icon_library' ),
		};
	}

	initialize( ...args ) {
		super.initialize( ...args );

		this.showLogo();
	}
}
