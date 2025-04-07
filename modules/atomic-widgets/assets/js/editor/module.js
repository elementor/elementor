import Component from './component';

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );

		this.registerAtomicWidgetTypes();
	}

	registerAtomicWidgetTypes() {
		this.registerAtomicDivBlockType();
	}

	registerAtomicDivBlockType() {
		const DivBlock = require( './div-block-type' ).default;
		const FlexBox = require( './flexbox-type' ).default;

		elementor.elementsManager.registerElementType( new DivBlock() );
		elementor.elementsManager.registerElementType( new FlexBox() );
	}
}

new Module();
