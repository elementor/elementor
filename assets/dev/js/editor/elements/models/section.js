import ElementModel from './element';

export default class Section extends ElementModel {
	/**
	 * Allow only column.
	 */
	isValidChild( childModel ) {
		return 'column' === childModel.get( 'elType' );
	}
}
