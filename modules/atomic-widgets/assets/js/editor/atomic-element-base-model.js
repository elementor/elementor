export default class AtomicElementBaseModel extends elementor.modules.elements.models.Element {
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
		const elementType = this.get( 'elType' );
		this.config = elementor.config.elements[ elementType ];

		const isNewElementCreate = 0 === this.get( 'elements' ).length &&
            $e.commands.currentTrace.includes( 'document/elements/create' );

		if ( isNewElementCreate ) {
			this.onElementCreate();
		}

		super.initialize( attributes, options );
	}

	getDefaultChildren() {
		const { default_children: defaultChildren } = this.config;

		return this.modifyDefaultChildren( defaultChildren );
	}

	onElementCreate() {
		this.set( 'elements', this.getDefaultChildren().map( ( element ) => this.buildElement( element ) ) );
	}

	modifyDefaultChildren( element ) {
		return element;
	}

	buildElement( element ) {
		const id = elementorCommon.helpers.getUniqueId();

		const elements = ( element.elements || [] ).map( ( el ) => this.buildElement( el ) );

		return {
			elType: element.elType,
			widgetType: element.widgetType,
			id,
			settings: element.settings ?? {},
			elements,
			isLocked: element.isLocked || false,
			editor_settings: element.editor_settings || {},
		};
	}
}
