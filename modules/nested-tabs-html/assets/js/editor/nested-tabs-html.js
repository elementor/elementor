import View from './views/view';
export class NestedTabsHtml extends elementor.modules.elements.types.NestedElementBase {
	getType() {
		return 'nested-tabs-html';
	}

	getView() {
		return View;
	}
}

export default NestedTabsHtml;
