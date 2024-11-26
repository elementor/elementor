import Base from '../../elements/types/base/element-base';
import EmptyComponent from '../../elements/views/container/empty-component';
import Model from '../models/a-container';
import { default as View } from '../views/a-container';

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
