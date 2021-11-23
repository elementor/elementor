import { default as WidgetRepeaterView } from '../nested-repeater/views/widget-repeater';
import WidgetRepeaterModel from '../nested-repeater/models/widget-repeater-model';
import WidgetRepeaterEmptyView from '../nested-repeater/views/widget-repeater/empty';

/**
 * @extends {ElementBase}
 */
export default class WidgetRepeater extends elementor.modules.widgets.Base {
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
