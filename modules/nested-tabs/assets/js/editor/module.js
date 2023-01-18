import NestedTabs from './nested-tabs';

export default class Module {
	constructor() {
		elementor.elementsManager.registerElementType( new NestedTabs() );
	}
}
