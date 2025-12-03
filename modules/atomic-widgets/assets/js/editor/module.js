import Component from './component';
import AtomicElementBaseType from './atomic-element-base-type';
import createAtomicElementViewBase from './create-atomic-element-base-view';
import AtomicElementBaseModel from './atomic-element-base-model';
import createDivBlockType from './atomic-element-types/create-div-block-type';
import createFlexboxType from './atomic-element-types/create-flexbox-type';
import createAtomicTabsType from './atomic-element-types/atomic-tabs/create-atomic-tabs-type';
import createAtomicTabContentType from './atomic-element-types/atomic-tab-content/create-atomic-tab-content-type';
import createAtomicTabType from './atomic-element-types/atomic-tab/create-atomic-tab-type';
import createAtomicTabsMenuType from './atomic-element-types/atomic-tabs-menu/create-atomic-tabs-menu-type';
import createAtomicTabsContentAreaType from './atomic-element-types/atomic-tabs-content-area/create-atomic-tabs-content-area-type';

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

		elementor.elementsManager.registerElementType( createAtomicTabsType() );
		elementor.elementsManager.registerElementType( createAtomicTabContentType() );
		elementor.elementsManager.registerElementType( createAtomicTabType() );
		elementor.elementsManager.registerElementType( createAtomicTabsMenuType() );
		elementor.elementsManager.registerElementType( createAtomicTabsContentAreaType() );
	}
}

new Module();
