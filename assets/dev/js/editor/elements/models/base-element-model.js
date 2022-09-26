/**
 * @typedef {import('elementor/assets/lib/backbone/backbone.marionette')} Backbone
 */

/**
 * The class purpose is to share the common methods and properties between all available models.
 */
export default class BaseElementModel extends Backbone.Model {
	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Function isValidChild().
	 *
	 * Validates if `childModel` can be added to this model as a child.
	 * Each model should have its own implementation of this method against all possible child models.
	 *
	 * @param {Backbone.Model} childModel
	 *
	 * @return {boolean} Whether the child model is valid or not.
	 */
	isValidChild( childModel ) { // eslint-disable-line no-unused-vars
		elementorModules.ForceMethodImplementation( { attributes: this.attributes } );
	}
}
