import Component from './component';
import AtomicElementBaseType from './atomic-element-base-type';
import createAtomicElementViewBase from './create-atomic-element-base-view';
import AtomicElementBaseModel from './atomic-element-base-model';
import createAtomicFormType from './atomic-element-types/atomic-form/create-atomic-form-type';
import createFormSuccessMessageType from './atomic-element-types/atomic-form/create-form-success-message-type';
import createFormErrorMessageType from './atomic-element-types/atomic-form/create-form-error-message-type';
import createDivBlockType from './atomic-element-types/create-div-block-type';
import createFlexboxType from './atomic-element-types/create-flexbox-type';

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );

		this.exposeAtomicElementClasses();
		this.registerAtomicElements();
	}

	exposeAtomicElementClasses() {
		elementor.modules.elements.types.AtomicElementBase = AtomicElementBaseType;
		elementor.modules.elements.views.createAtomicElementBase = createAtomicElementViewBase;
		elementor.modules.elements.models.AtomicElementBase = AtomicElementBaseModel;
	}

	registerAtomicElements() {
		elementor.elementsManager.registerElementType( createDivBlockType() );
		elementor.elementsManager.registerElementType( createFlexboxType() );
		elementor.elementsManager.registerElementType( createAtomicFormType() );
		elementor.elementsManager.registerElementType( createFormSuccessMessageType() );
		elementor.elementsManager.registerElementType( createFormErrorMessageType() );
	}
}

new Module();
