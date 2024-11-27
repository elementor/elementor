import Component from './component';

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		const AContainerClass = require( '../../../../../assets/dev/js/editor/atomic-widgets/types/a-container' ).default;

		$e.components.register( new Component() );
		elementor.elementsManager.registerElementType( new AContainerClass() );
	}
}

new Module();
