// TODO Remove, navigator should be module.
export default class Navigator {
	constructor( container ) {
		this.container = container;
	}

	/**
	 * @type {Element}
	 */
	view;

	/**
	 * Elements model.
	 *
	 * @type {Backbone.Model}
	 */
	model;
}
