import ModalLayout from './modal-layout';
import Component from './component';

export default class extends elementorModules.Module {
	onInit() {
		this.layout = new ModalLayout();

		elementorCommon.components.register( new Component(), { parent: this } );
	}
}
