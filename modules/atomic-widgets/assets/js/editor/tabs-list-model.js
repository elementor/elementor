export default class AtomicTabsList extends elementor.modules.elements.models.Element {
	initialize( attributes, options ) {
		this.config = elementor.widgetsCache[ 'e-tabs-list' ];

		const isNewElementCreate = 0 === this.get( 'elements' ).length &&
			$e.commands.currentTrace.includes( 'document/elements/create' );

		if ( isNewElementCreate ) {
			this.onElementCreate();
		}

		super.initialize( attributes, options );
	}

	/**
	 * Do not allow section, column or container be placed in the Atomic tabs list.
	 *
	 * @param {*} childModel
	 */
	isValidChild( childModel ) {
		const elType = childModel.get( 'elType' );

		return 'section' !== elType && 'column' !== elType;
	}

	getDefaultChildren() {
		const { defaultChildren } = this.config,
			result = [];

		defaultChildren.forEach( ( element ) => {
			element.id = elementorCommon.helpers.getUniqueId();
			element.settings = element.settings || {};
			element.elements = element.elements || [];
			element.isLocked = true;

			result.push( element );
		} );

		return result;
	}

	onElementCreate() {
		this.set( 'elements', this.getDefaultChildren() );
	}
} 