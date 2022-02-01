import ElementBase from 'elementor-elements/elements/base';

export default class WidgetBase extends ElementBase {
	/**
	 * @return {string}
	 */
	getWidgetType() {
		elementorModules.ForceMethodImplementation();
	}

	getTypeIndex() {
		return this.getType() + '-' + this.getWidgetType();
	}
}
