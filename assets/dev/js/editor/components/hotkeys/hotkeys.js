import Component from './component';

export default class extends elementorModules.Module {
	onInit() {
		$e.components.register( new Component( { manager: this } ) );
	}
}
