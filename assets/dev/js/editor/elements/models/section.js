import { default as ElementModel } from './element';

/**
 * @typedef {import('../../../editor/elements/models/base-element-model')} BaseModel
 */

export default class Section extends ElementModel {
	/**
	 * Allow only column.
	 *
	 * @param {BaseModel} childModel
	 */
	isValidChild( childModel ) {
		return 'column' === childModel.get( 'elType' );
	}
}
