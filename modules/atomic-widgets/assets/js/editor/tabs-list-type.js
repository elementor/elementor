import EmptyComponent from 'elementor-elements/views/container/empty-component';
import Model from './tabs-list-model';
import { default as View } from './tabs-list-view';

export default class AtomicTabsList extends elementor.modules.elements.types.Base {
	getType() {
		return 'e-tabs-list';
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