import View from './views/view';
import EmptyView from './views/empty';

/**
 * @extends {WidgetBase}
 */
export class TabsV2 extends elementor.modules.elements.types.Base {
	getType() {
		return 'tabs-v2';
	}

	getView() {
		return View;
	}

	getEmptyView() {
		return EmptyView;
	}

	getModel() {
		return $e.components.get( 'nested-elements/nested-repeater' ).exports.NestedModelBase;
	}
}

export default TabsV2;
