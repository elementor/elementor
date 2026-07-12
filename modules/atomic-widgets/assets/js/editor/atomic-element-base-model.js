export default class AtomicElementBaseModel extends elementor.modules.elements.models.Element {
	static childrenDependenciesAdapter = null;

	static setChildrenDependenciesAdapter( adapter ) {
		AtomicElementBaseModel.childrenDependenciesAdapter = adapter;
	}

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

		const isEmpty = 0 === this.get( 'elements' ).length;
		const isNewElementCreate = isEmpty &&
			$e.commands.currentTrace.includes( 'document/elements/create' );
		const hasHydrateFlag = this.get( 'hydrateDefaultChildren' );

		if ( hasHydrateFlag ) {
			this.unset( 'hydrateDefaultChildren', { silent: true } );
		}

		if ( isNewElementCreate || ( isEmpty && hasHydrateFlag ) ) {
			this.onElementCreate();
		}

		this.reconcileChildrenAgainstSchema( attributes );

		super.initialize( attributes, options );

		this.bindChildrenReconcile();
	}

	reconcileChildrenAgainstSchema( attributes ) {
		if ( ! this.config?.children_dependencies?.length ) {
			return;
		}

		const adapter = AtomicElementBaseModel.childrenDependenciesAdapter;

		if ( ! adapter?.reconcileInitialChildren ) {
			return;
		}

		attributes.elements = this.get( 'elements' );

		adapter.reconcileInitialChildren( {
			elementId: this.get( 'id' ),
			elementConfig: this.config,
			attributes,
		} );

		this.set( 'elements', attributes.elements );
	}

	bindChildrenReconcile() {
		if ( ! this.config?.children_dependencies?.length ) {
			return;
		}

		const adapter = AtomicElementBaseModel.childrenDependenciesAdapter;

		if ( ! adapter?.bindSettingsReconcile ) {
			return;
		}

		this.unbindChildrenReconcile?.();

		this.unbindChildrenReconcile = adapter.bindSettingsReconcile( {
			model: this,
			elementConfig: this.config,
		} );

		this.once( 'destroy', () => this.unbindChildrenReconcile?.() );
	}

	getDefaultChildren() {
		const { default_children: defaultChildren } = this.config;

		return this.modifyDefaultChildren( defaultChildren );
	}

	onElementCreate() {
		if ( this.get( 'skipDefaultChildren' ) ) {
			this.unset( 'skipDefaultChildren', { silent: true } );
			return;
		}

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
			meta: element.meta || {},
			...( element.skipDefaultChildren ? {} : { hydrateDefaultChildren: true } ),
		};
	}
}
