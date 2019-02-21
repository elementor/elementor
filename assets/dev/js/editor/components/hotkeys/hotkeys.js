import ModalLayout from './modal-layout';

export default class extends elementorModules.Module {
	onInit() {
		this.layout = new ModalLayout();

		elementor.route.register( 'editor/shortcuts', () => this.layout.showModal(), 'c+?' );
	}
}
