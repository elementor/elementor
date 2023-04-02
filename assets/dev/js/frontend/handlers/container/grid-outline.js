export default class GridOutline extends elementorModules.frontend.handlers.Base {
	isActive() {
		return elementorFrontend.isEditMode();
	}

	getDefaultSettings() {
		return {
			selectors: {
				gridOutline: '.e-grid-outline',
				directGridOverlay: ':scope > .e-grid-outline',
				boxedContainer: ':scope > .e-con-inner',
			},
			classes: {
				outline: 'e-grid-outline',
				outlineItem: 'e-grid-outline-item',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			container = this.$element[ 0 ];

		return {
			container,
			outlineParentContainer: null,
			gridOutline: this.findElement( selectors.gridOutline ),
			directChildGridOverlay: this.findElement( selectors.directGridOverlay ),
		};
	}

	onInit() {
		super.onInit();

		this.initLayoutOverlay();
	}

	bindEvents() {
		elementorFrontend.elements.$window.on( 'resize', this.onDeviceModeChange.bind( this ) );
		this.addChildLifeCycleEventListeners();
	}

	unbindEvents() {
		this.removeChildLifeCycleEventListeners();
		elementorFrontend.elements.$window.off( 'resize', this.onDeviceModeChange.bind( this ) );
	}


	/**
	 * @param {jQuery} $child
	 */
	initLayoutOverlay() {
		this.getContainer();

		if ( ! this.elements.outlineParentContainer ) {
			return;
		}

		this.removeExistingOverlay();
		this.createOverlayContainer();
		this.createOverlayItems();
	}

	getContainer() {
		const { grid_outline: gridOutline } = this.getElementSettings();

		if ( gridOutline && '' !== gridOutline ) {
			return this.getCorrectContainer();
		}
	}

	getCorrectContainer() {
		const { container } = this.elements,
			getDefaultSettings = this.getDefaultSettings(),
			{ selectors: { boxedContainer } } = getDefaultSettings;

		this.elements.outlineParentContainer = container.querySelector( boxedContainer ) || container;
	}

	removeExistingOverlay() {
		const { gridOutline } = this.elements;

		gridOutline?.remove();
	}

	createOverlayContainer() {
		const { outlineParentContainer } = this.elements,
			{ classes: { outline } } = this.getDefaultSettings(),
			gridOutline = document.createElement( 'div' );

		gridOutline.classList.add( outline );
		outlineParentContainer.appendChild( gridOutline );

		this.elements.gridOutline = gridOutline;

		setTimeout( () => {
			this.getGridDimensions();
		}, 1000 );

		this.setGridOutlineDimensions();
	}

	createOverlayItems() {
		const { gridOutline } = this.elements,
			{ classes: { outlineItem } } = this.getDefaultSettings(),
			{ rows, columns } = this.getGridDimensions(),
			numberOfItems = rows.split( ' ' ).length * columns.split( ' ' ).length;

		setTimeout( () => {
			for ( let i = 0; i < numberOfItems; i++ ) {
				const gridOutlineItem = document.createElement( 'div' );

				gridOutlineItem.classList.add( outlineItem );
				gridOutline.appendChild( gridOutlineItem );
			}
		}, 1000 );
	}

	getGridDimensions() {
		const { outlineParentContainer } = this.elements;

		return {
			rows: this.getComputedStyle( outlineParentContainer, 'grid-template-rows' ),
			columns: this.getComputedStyle( outlineParentContainer, 'grid-template-columns' ),
		};
	}

	setGridOutlineDimensions() {
		const { gridOutline } = this.elements,
			{ rows, columns } = this.getGridDimensions();

		gridOutline.style.gridTemplateColumns = columns;
		gridOutline.style.gridTemplateRows = rows;
	}

	getComputedStyle( container, property ) {
		return window.getComputedStyle( container, null ).getPropertyValue( property );
	}

	onElementChange( propertyName ) {
		let propsThatTriggerGridLayoutRender = [
			'grid_rows_grid',
			'grid_columns_grid',
			'grid_gaps',
			'container_type',
			'boxed_width',
			'content_width',
			'height',
			'min_height',
			'padding',
		];

		// Add responsive control names to the list of controls that trigger re rendering.
		propsThatTriggerGridLayoutRender = this.getResponsiveControlNames( propsThatTriggerGridLayoutRender );

		if ( propsThatTriggerGridLayoutRender.includes( propertyName ) ) {
			this.initLayoutOverlay();
		}
	}

	getResponsiveControlNames( propsThatTriggerGridLayoutRender ) {
		const activeBreakpoints = elementorFrontend.breakpoints.getActiveBreakpointsList();

		propsThatTriggerGridLayoutRender.forEach( ( prop ) => {
			activeBreakpoints.forEach( ( breakpoint ) => {
				propsThatTriggerGridLayoutRender.push( prop + '_' + breakpoint );
			} );
		} );

		return propsThatTriggerGridLayoutRender;
	}

	onDeviceModeChange() {
		this.initLayoutOverlay();
	}

	/**
	 * Rerender Grid Overlay when child element is added or removed from its parent.
	 *
	 * @return {void}
	 */
	addChildLifeCycleEventListeners() {
		this.lifecycleChangeListener = this.initLayoutOverlay.bind( this );

		window.addEventListener( 'elementor/editor/element-rendered', this.lifecycleChangeListener );
		window.addEventListener( 'elementor/editor/element-destroyed', this.lifecycleChangeListener );
	}

	removeChildLifeCycleEventListeners() {
		window.removeEventListener( 'elementor/editor/element-rendered', this.lifecycleChangeListener );
		window.removeEventListener( 'elementor/editor/element-destroyed', this.lifecycleChangeListener );
	}
}
