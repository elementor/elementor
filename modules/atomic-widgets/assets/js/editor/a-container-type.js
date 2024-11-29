import EmptyComponent from '../../../../../assets/dev/js/editor/elements/views/container/empty-component';
import Model from './a-container-model';
import { default as View } from './a-container-view';

export default class AtomicContainer extends elementor.modules.elements.types.Base {
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
