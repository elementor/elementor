import { default as View } from '../views/view';
import EmptyView from '../views/empty';

/**
 * @extends {WidgetBase}
 */
export class TabsV2 extends elementor.modules.elements.types.base.WidgetBase {
	getType() {
		return 'widget';
	}

	getWidgetType() {
		return 'nested-tabs';
	}

	getView() {
		return View;
	}

	getEmptyView() {
		return EmptyView;
	}

	getModel() {
		return $e.components.get( 'nested-elements/nested-repeater' ).exports.WidgetRepeaterModelBase;
	}
}
