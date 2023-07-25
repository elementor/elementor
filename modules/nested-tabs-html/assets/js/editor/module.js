import NestedTabsHtml from './nested-tabs-html';

export default class Module {
	constructor() {
		elementor.elementsManager.registerElementType( new NestedTabsHtml() );
	}
}
