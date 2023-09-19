import NestedAccordion from './handlers/nested-accordion';
import NestedAccordionTitleKeyboardHandler from './handlers/nested-accordion-title-keyboard-handler';

export default class extends elementorModules.Module {
	constructor() {
		super();
		elementorFrontend.elementsHandler.attachHandler( 'nested-accordion', [
			NestedAccordion,
			NestedAccordionTitleKeyboardHandler,
		] );
	}
}
