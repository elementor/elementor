import { default as NestedTabsView } from '../views/nested-tabs';
import NestedTabsEmptyView from '../views/empty';

/**
 * @extends {WidgetBase}
 */
export class NestedTabs extends elementor.modules.elements.types.base.WidgetBase {
	getType() {
		return 'widget';
	}

	getWidgetType() {
		return 'nested-tabs';
	}

	getView() {
		return NestedTabsView;
	}

	getEmptyView() {
		return NestedTabsEmptyView;
	}

	getModel() {
		return $e.components.get( 'nested-elements/nested-repeater' ).exports.WidgetRepeaterModelBase;
	}
}
