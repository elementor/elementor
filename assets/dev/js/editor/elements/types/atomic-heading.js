import Base from '../types/base/element-base';
import Model from 'elementor-elements/models/widget';
import { default as View } from 'elementor-elements/views/atomic-heading';

export default class AtomicHeading extends Base {
	getType() {
		return 'a-heading';
	}

	getView() {
		return View;
	}

	getModel() {
		return Model;
	}
}
