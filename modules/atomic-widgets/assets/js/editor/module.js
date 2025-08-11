import Component from './component';
import EmptyComponent from 'elementor-elements/views/container/empty-component';
import Model from './atomic-element-model';
import { createAtomicElementView } from './atomic-element-view';

class DynamicAtomicElementType extends elementor.modules.elements.types.Base {
	constructor( elementType, view ) {
		super();
		this.elementType = elementType;
		this.view = view;
	}

	getType() {
		return this.elementType;
	}

	getView() {
		return this.view;
	}

	getEmptyView() {
		return EmptyComponent;
	}

	getModel() {
		return Model;
	}
}

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );

		this.registerAtomicWidgetTypes();
	}

	registerAtomicWidgetTypes() {
		this.registerDynamicAtomicTypes();
	}

	registerDynamicAtomicTypes() {
		// Get element types from elementor.atomic.elements
		const atomicElements = elementor?.config?.atomic?.elements || [];

		// Register each element type dynamically
		atomicElements.forEach( ( elementType ) => {
			const view = createAtomicElementView( elementType );
			const dynamicType = new DynamicAtomicElementType( elementType, view );
			elementor.elementsManager.registerElementType( dynamicType );
		} );
	}
}

new Module();
