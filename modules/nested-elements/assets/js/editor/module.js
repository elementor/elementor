import Component from './component';

export default class NestedElementsModule {
	constructor() {
		this.component = $e.components.register( new Component() );
	}
}
