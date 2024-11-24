import { AtomicWidgetView } from './atomic-widget-view';

export class AtomicWidgetType extends elementor.modules.elements.types.Widget {
	_type;

	constructor( type ) {
		super();

		this._type = type;
	}

	getType() {
		return this._type;
	}

	getView() {
		return AtomicWidgetView;
	}
}
