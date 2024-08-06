import NewFloatingElementsView from 'elementor-admin/floating-elements/view';

export default class extends elementorModules.common.views.modal.Layout {
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
		elementorModules.common.views.modal.Layout.prototype.initialize.apply( this, arguments );

		this.showLogo();

		this.showContentView();
	}

	showContentView() {
		this.modalContent.show( new NewFloatingElementsView() );
	}
}
