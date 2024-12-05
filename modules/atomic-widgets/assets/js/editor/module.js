import Component from './component';
import { AtomicWidgetType } from './atomic-widget-type';

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
	}
}

new Module();
