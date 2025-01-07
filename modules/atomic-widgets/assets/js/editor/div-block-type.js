import EmptyComponent from 'elementor-elements/views/container/empty-component';
import Model from './div-block-model';
import { default as View } from './div-block-view';

export default class AtomicContainer extends elementor.modules.elements.types.Base {
	getType() {
		return 'div-block';
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
