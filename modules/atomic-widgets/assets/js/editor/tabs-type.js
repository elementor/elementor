import EmptyComponent from 'elementor-elements/views/container/empty-component';
import Model from './tabs-model';
import { default as View } from './tabs-view';

export default class AtomicTabs extends elementor.modules.elements.types.Base {
	getType() {
		return 'e-tabs';
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