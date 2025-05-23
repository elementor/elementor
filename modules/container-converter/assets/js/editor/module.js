import Component from './component';

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );
	}
}

new Module();
