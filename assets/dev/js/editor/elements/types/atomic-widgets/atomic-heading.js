import { default as View } from 'elementor-elements/views/atomic-widgets/atomic-heading';
import AtomicWidgetBase from '../atomic-widget-base';

export default class AtomicHeading extends AtomicWidgetBase {
	getType() {
		return 'a-heading';
	}

	getView() {
		return View;
	}
}
