import ModalLayout from './modal-layout';

export default class extends elementorModules.Module {
	onInit() {
		this.layout = new ModalLayout();

		elementorCommon.route.register( 'shortcuts', () => this.layout.showModal(), { keys: 'ctrl+?' } );

		this.layout.getModal().on( 'hide', () => elementorCommon.route.close( 'shortcuts' ) );
	}
}
