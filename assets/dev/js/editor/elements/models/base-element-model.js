/**
 * The class purpose is to share the common methods and properties between all available models.
 */
export default class BaseElementModel extends Backbone.Model {
	/**
	 * Function isValidChild().
	 *
	 * Validates if `childModel` can be added to this model as a child.
	 * Each model should have its own implementation of this method against all possible child models.
	 *
	 * @param {Backbone.Model} childModel
	 *
	 * @return {boolean}
	 */
	isValidChild( childModel ) { // eslint-disable-line no-unused-vars
		elementorModules.ForceMethodImplementation( { attributes: this.attributes } );
	}
}
