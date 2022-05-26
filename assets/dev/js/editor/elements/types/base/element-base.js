/**
 * @name elementor.elements.types.Base
 */
export default class ElementBase {
	/**
	 * Get element type.
	 * The type will be used by the editor to identify the element.
	 *
	 * @return {string}
	 */
	getType() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Get Element view.
	 *
	 * @return {typeof Marionette.View}
	 */
	getView() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Get Empty view.
	 *
	 * A react component that will be rendered when the element is empty.
	 *
	 * @return {typeof React.Component}
	 */
	getEmptyView() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Get model.
	 *
	 * The model is the object that contains the data of the element and the logic to work with it.
	 *
	 * @return {typeof BaseElementModel}
	 */
	getModel() {
		elementorModules.ForceMethodImplementation();
	}
}
