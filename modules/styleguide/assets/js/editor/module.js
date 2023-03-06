import Component from './component';
require( '../lib/dialog' );

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );
	}
}

new Module();
