export default class ElementBase {
	/**
	 * @return {string}
	 */
	getType() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * @return {typeof Marionette.View}
	 */
	getView() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * @return {typeof React.Component}
	 */
	getEmptyView() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * @return {typeof BaseModel}
	 */
	getModel() {
		elementorModules.ForceMethodImplementation();
	}
}
