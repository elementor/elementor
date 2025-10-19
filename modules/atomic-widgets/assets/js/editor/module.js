import Component from './component';
import AtomicElementBaseType from './atomic-element-base-type';
import createAtomicElementViewBase from './create-atomic-element-base-view';
import AtomicElementBaseModel from './atomic-element-base-model';
import createDivBlockType from './atomic-element-types/create-div-block-type';
import createFlexboxType from './atomic-element-types/create-flexbox-type';
import createAtomicTabsType from './atomic-element-types/atomic-tabs/create-atomic-tabs-type';
import createAtomicTabPanelType from './atomic-element-types/atomic-tab-panel/create-atomic-tab-panel-type';
import createAtomicTabType from './atomic-element-types/atomic-tab/create-atomic-tab-type';
import createAtomicTabsListType from './atomic-element-types/create-atomic-tabs-list-type';
import createAtomicTabsContentType from './atomic-element-types/create-atomic-tabs-content-type';

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
		const nestedElementsExperiment = 'e_nested_elements';

		elementor.elementsManager.registerElementType( createDivBlockType() );
		elementor.elementsManager.registerElementType( createFlexboxType() );

		if ( elementorCommon.config.experimentalFeatures[ nestedElementsExperiment ] ) {
			elementor.elementsManager.registerElementType( createAtomicTabsType() );
			elementor.elementsManager.registerElementType( createAtomicTabPanelType() );
			elementor.elementsManager.registerElementType( createAtomicTabType() );
			elementor.elementsManager.registerElementType( createAtomicTabsListType() );
			elementor.elementsManager.registerElementType( createAtomicTabsContentType() );
		}
	}
}

new Module();
