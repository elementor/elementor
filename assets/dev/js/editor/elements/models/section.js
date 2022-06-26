import ElementModel from './element';

export default class Section extends ElementModel {
	/**
	 * Allow only column.
	 *
	 * @param  childModel
	 */
	isValidChild( childModel ) {
		return 'column' === childModel.get( 'elType' );
	}
}
