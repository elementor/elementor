import View from './views/view';
export class NestedTabs extends elementor.modules.elements.types.NestedElementBase {
	getType() {
		return 'nested-tabs';
	}

	getView() {
		return View;
	}
}

export default NestedTabs;
