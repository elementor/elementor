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

		if ( this.config?.meta?.permanently_locked ) {
			this.set( 'isLocked', true );
		}

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

	getRequiredChildren() {
		const { required_children: requiredChildren = [] } = this.config;

		return this.modifyRequiredChildren( requiredChildren );
	}

	onElementCreate() {
		const shouldSkipDefaultChildren = this.get( 'skipDefaultChildren' );
		const defaultChildren = this.getDefaultChildren();
		const requiredChildren = this.getRequiredChildren().map( ( child ) => this.markElementAsRequired( child ) );
		const childrenTemplate = defaultChildren.length > 0 ? defaultChildren : requiredChildren;
		const childrenForCreate = shouldSkipDefaultChildren
			? childrenTemplate.filter( ( child ) => this.isRequiredElement( child ) )
			: childrenTemplate;

		if ( shouldSkipDefaultChildren ) {
			this.unset( 'skipDefaultChildren', { silent: true } );
		}

		this.set( 'elements', childrenForCreate.map( ( element ) => this.buildElement( element ) ) );
	}

	modifyDefaultChildren( element ) {
		return element;
	}

	modifyRequiredChildren( element ) {
		return element;
	}

	isRequiredElement( element ) {
		return !! element?.meta?.required;
	}

	markElementAsRequired( element ) {
		return {
			...element,
			meta: {
				...( element.meta || {} ),
				required: true,
			},
		};
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
			meta: element.meta || {},
		};
	}
}
