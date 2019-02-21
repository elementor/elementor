import ModalLayout from './modal-layout';

export default class extends elementorModules.Module {
	onInit() {
		this.layout = new ModalLayout();

		elementorCommon.route.register( 'editor/shortcuts', () => this.layout.showModal(), 'ctrl+?' );
	}
}
