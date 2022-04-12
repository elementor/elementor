import Base from '../types/base/element-base';
import Model from 'elementor-elements/models/section';
import { default as View } from 'elementor-elements/views/section';

export default class Section extends Base {
	getType() {
		return 'section';
	}

	getView() {
		return View;
	}

	getModel() {
		return Model;
	}
}
