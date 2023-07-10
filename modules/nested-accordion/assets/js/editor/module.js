import NestedAccordion from './nested-accordion';

export default class Module {
	constructor() {
		elementor.elementsManager.registerElementType( new NestedAccordion() );
	}
}
