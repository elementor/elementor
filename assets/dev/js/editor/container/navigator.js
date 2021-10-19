import Base from './base';

// TODO Remove, navigator should be module.
export default class Navigator extends Base {
	/**
	 * @type {e.elementor.navigator.Element}
	 */
	view;

	/**
	 * Elements model.
	 *
	 * @type {Backbone.Model}
	 */
	model;
}
