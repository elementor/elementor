export default class AtomicContainer extends elementor.modules.elements.models.Element {
	/**
	 * Do not allow section, column or container be placed in the Atomic container.
	 *
	 * @param {*} childModel
	 */
	isValidChild( childModel ) {
		const elType = childModel.get( 'elType' );

		return 'section' !== elType && 'column' !== elType;
	}

	initialize( attributes, options ) {
		this.config = elementor.widgetsCache[ 'e-div-block' ];

		const isNewElementCreate = 0 === this.get( 'elements' ).length &&
			$e.commands.currentTrace.includes( 'document/elements/create' );

		if ( isNewElementCreate ) {
			this.onElementCreate();
		}

		super.initialize( attributes, options );
	}

	getDefaultChildren() {
		const { defaultChildren } = this.config;

		const formatRestrictions = ( restrictions ) => {
			return Object.entries( restrictions ).reduce( ( acc, [ name, val ] ) => {
				if ( 'scope' === name && 'parent' === val ) {
					acc[ name ] = this.id;
					return acc;
				}
				acc[ name ] = val;
				return acc;
			}, {} );
		};

		return defaultChildren.map( ( element ) => {
			const restrictions = formatRestrictions( element.restrictions || {} );
			return {
				elType: element.elType,
				widgetType: element.widgetType,
				id: elementorCommon.helpers.getUniqueId(),
				settings: element.settings || {},
				elements: element.elements || [],
				restrictions,
			};
		} );
	}

	onElementCreate() {
		this.set( 'elements', this.getDefaultChildren() );
	}
}
