import Component from './component';

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );

		this.registerAtomicWidgetTypes();
	}

	registerAtomicWidgetTypes() {
		Object.entries( elementor.widgetsCache ?? {} )
			.filter( ( [ , widget ] ) => !! widget.atomic )
			.forEach(
				( [ type ] ) => elementor.elementsManager.registerElementType( new AtomicWidgetType( type ) ),
			);

		this.registerAtomicDivBlockType();
	}

	registerAtomicDivBlockType() {
		const AContainerClass = require( './div-block-type' ).default;

		elementor.elementsManager.registerElementType( new AContainerClass() );
	}
}

new Module();
