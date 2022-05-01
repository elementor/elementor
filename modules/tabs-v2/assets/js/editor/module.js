import TabsV2 from './tabs-v2';

export default class Module {
	constructor() {
		elementor.elementsManager.registerElementType( new TabsV2() );
	}
}

