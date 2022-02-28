import { default as WidgetRepeaterView } from '../views/widget-repeater';
import WidgetRepeaterModel from '../models/widget-repeater-model';
import WidgetRepeaterEmptyView from '../views/widget-repeater/empty';

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
		return WidgetRepeaterView;
	}

	getEmptyView() {
		return WidgetRepeaterEmptyView;
	}

	getModel() {
		return WidgetRepeaterModel;
	}
}
