/* eslint-disable jsdoc/require-returns-check */

/**
 * @typedef {import('elementor/assets/lib/backbone/backbone.marionette')} Marionette
 * @typedef {import('../../../elements/models/base-element-model')} BaseModel
 */

export default class ElementBase {
	/**
	 * @return {string} Element Type.
	 */
	getType() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * @return {Marionette.View} Element Marionette View.
	 */
	getView() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * @return {React.Component} React Component.
	 */
	getEmptyView() {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * @return {BaseModel} Element Model.
	 */
	getModel() {
		elementorModules.ForceMethodImplementation();
	}
}
