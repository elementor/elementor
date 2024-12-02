// TODO: Is this file in use?
// eslint-disable-next-line import/no-unresolved
import Base from '../types/base/element-base';
import EmptyComponent from 'elementor-elements/views/container/empty-component';
import Model from 'elementor-elements/models/a-container';
import { default as View } from 'elementor-elements/views/a-container';

export default class Container extends Base {
	getType() {
		return 'a-container';
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
