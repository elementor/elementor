import NestedTabs from './tabs-v2';

export default class Module {
	constructor() {
		elementor.elementsManager.registerElementType( new NestedTabs() );
	}
}

