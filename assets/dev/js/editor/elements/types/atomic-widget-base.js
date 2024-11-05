import Base from '../types/base/element-base';
import Model from 'elementor-elements/models/widget';
import { default as View } from 'elementor-elements/views/atomic-widget-base';

export default class AtomicWidgetBase extends Base {
	getModel() {
		return Model;
	}

	getView() {
		return View;
	}
}
