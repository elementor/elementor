import AtomicElementBaseModel from './atomic-element-base-model';
import AtomicElementBaseType from './atomic-element-base-type';
import Component from './component';
import createAtomicElementViewBase from './create-atomic-element-base-view';
import createDivBlockType from './atomic-element-types/create-div-block-type';
import createFlexboxType from './atomic-element-types/create-flexbox-type';
import createGridType from './atomic-element-types/create-grid-type';

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );

		this.wireChildrenDependenciesAdapter();
		this.exposeAtomicElementClasses();
		this.registerAtomicElements();
	}

	wireChildrenDependenciesAdapter() {
		const api = window.elementorV2?.editorElements;

		if ( ! api?.reconcileInitialChildren || ! api?.bindSettingsReconcile ) {
			return;
		}

		AtomicElementBaseModel.setChildrenDependenciesAdapter( {
			reconcileInitialChildren: api.reconcileInitialChildren,
			bindSettingsReconcile: api.bindSettingsReconcile,
		} );
	}

	exposeAtomicElementClasses() {
		elementor.modules.elements.types.AtomicElementBase = AtomicElementBaseType;
		elementor.modules.elements.views.createAtomicElementBase = createAtomicElementViewBase;
		elementor.modules.elements.models.AtomicElementBase = AtomicElementBaseModel;
	}

	registerAtomicElements() {
		this.registerAtomicElementTypeIfAbsent( createDivBlockType() );
		this.registerAtomicElementTypeIfAbsent( createFlexboxType() );
		this.registerAtomicElementTypeIfAbsent( createGridType() );
	}

	registerAtomicElementTypeIfAbsent( elementType ) {
		if ( elementor.elementsManager.getElementTypeClass( elementType.getType() ) ) {
			return;
		}

		elementor.elementsManager.registerElementType( elementType );
	}
}

new Module();
