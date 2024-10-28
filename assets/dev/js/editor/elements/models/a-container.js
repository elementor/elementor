import { default as ElementModel } from './element';

export default class Container extends ElementModel {
	/**
	 * Do not allow section or column be placed in the container.
	 *
	 * @param {*} childModel
	 */
	isValidChild( childModel ) {
		return true;
	}
}
