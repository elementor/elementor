import * as widgets from './widgets/';

export default class Module {
	constructor() {
		Object.values( widgets ).forEach(
			( WidgetClass ) => elementor.elementsManager.registerElementType( new WidgetClass )
		);
	}
}

