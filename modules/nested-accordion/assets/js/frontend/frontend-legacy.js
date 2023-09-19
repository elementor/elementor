import Module from 'elementor-assets-js/modules/imports/module.js';
import NestedAccordion from './handlers/nested-accordion';
import NestedAccordionTitleKeyboardHandler from './handlers/nested-accordion-title-keyboard-handler';

export default class extends Module {
	constructor() {
		super();

		elementorFrontend.elementsHandler.attachHandler( 'nested-accordion', [
			NestedAccordion,
			NestedAccordionTitleKeyboardHandler,
		] );
	}
}
