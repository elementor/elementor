import Base from '../types/base/element-base';
import EmptyComponent from 'elementor-elements/views/container/empty-component';
import Model from 'elementor-elements/models/container';
import { default as View } from 'elementor-elements/views/container';

export default class Container extends Base {
	getType() {
		return 'container';
	}

	getView() {
		return View;
	}

	getEmptyView() {
		return EmptyComponent;
	}

	getModel() {
		return Model;
	}
}
