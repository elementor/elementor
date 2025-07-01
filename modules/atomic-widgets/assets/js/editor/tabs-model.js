export default class AtomicTabs extends elementor.modules.elements.models.Element {
	/**
	 * Do not allow section, column or container be placed in the Atomic tabs.
	 *
	 * @param {*} childModel
	 */
	isValidChild( childModel ) {
		const elType = childModel.get( 'elType' );

		return 'section' !== elType && 'column' !== elType;
	}
} 