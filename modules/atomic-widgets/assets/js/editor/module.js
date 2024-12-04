import Component from './component';

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );

		this.registerAtomicDivBlockType();
	}

	registerAtomicDivBlockType() {
		const AContainerClass = require( './div-block-type' ).default;

		elementor.elementsManager.registerElementType( new AContainerClass() );
	}
}

new Module();
