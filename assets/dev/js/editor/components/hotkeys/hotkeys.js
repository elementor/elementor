import Component from './component';

export default class extends elementorModules.Module {
	onInit() {
		elementorCommon.components.register( new Component( { manager: this } ) );
	}
}
