import { default as ElementModel } from 'elementor-elements/models/element';

export default class AtomicContainer extends ElementModel {
	/**
	 * Do not allow section, column or container be placed in the Atomic container.
	 *
	 * @param {*} childModel
	 */
	isValidChild( childModel ) {
		const elType = childModel.get( 'elType' );

		return 'section' !== elType && 'column' !== elType && 'container' !== elType;
	}
}
