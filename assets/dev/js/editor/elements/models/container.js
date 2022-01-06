import ElementModel from './element';

export default class Container extends ElementModel {
	/**
	 * TODO Remove - Allow 'section; since library still uses section, blocks only column.
	 */
	isValidChild( childModel ) {
		// Get elType.
		const elType = childModel.get( 'elType' );

		return 'column' !== elType;
	}
}
