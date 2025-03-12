import EmptyComponent from 'elementor-elements/views/container/empty-component';
import Model from './e-div-block-model';
import { default as View } from './e-div-block-view';

export default class AtomicContainer extends elementor.modules.elements.types.Base {
	getType() {
		return 'e-div-block';
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
