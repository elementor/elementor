import { AtomicWidgetView } from './atomic-widget-view';

export class AtomicWidgetType extends elementor.modules.elements.types.Widget {
	#type;

	constructor( type ) {
		super();

		this.#type = type;
	}

	getType() {
		return this.#type;
	}

	getView() {
		return AtomicWidgetView;
	}
}
