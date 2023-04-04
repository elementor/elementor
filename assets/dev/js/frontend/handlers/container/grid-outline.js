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
		const selectors = this.getSettings( 'selectors' );

		return {
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

	initLayoutOverlay() {
		if ( ! this.shouldDrawOutline() ) {
			return;
		}

		this.getCorrectContainer();
		this.removeExistingOverlay();
		this.createOverlayContainer();
		this.createOverlayItems();
	}

	shouldDrawOutline() {
		const { grid_outline: gridOutline } = this.getElementSettings();

		return gridOutline;
	}

	getCorrectContainer() {
		const container = this.$element[ 0 ],
			getDefaultSettings = this.getDefaultSettings(),
			{ selectors: { boxedContainer } } = getDefaultSettings;

		this.elements.outlineParentContainer = container.querySelector( boxedContainer ) || container;
	}

	removeExistingOverlay() {
		this.elements.gridOutline?.remove();
	}

	createOverlayContainer() {
		const { outlineParentContainer } = this.elements,
			{ classes: { outline } } = this.getDefaultSettings(),
			gridOutline = document.createElement( 'div' );

		gridOutline.classList.add( outline );
		outlineParentContainer.appendChild( gridOutline );

		this.elements.gridOutline = gridOutline;

		this.setGridOutlineDimensions();
	}

	createOverlayItems() {
		const { gridOutline } = this.elements,
			{ classes: { outlineItem } } = this.getDefaultSettings(),
			{ rows, columns } = this.getDeviceGridDimensions(),
			numberOfItems = rows.length * columns.length;

		for ( let i = 0; i < numberOfItems; i++ ) {
			const gridOutlineItem = document.createElement( 'div' );

			gridOutlineItem.classList.add( outlineItem );
			gridOutline.appendChild( gridOutlineItem );
		}
	}

	/**
	 * Get the grid dimensions for the current device.
	 *
	 * @return { { columns: { value, length }, rows: { value, length } } }
	 */
	getDeviceGridDimensions() {
		const currentDevice = elementor.channels.deviceMode.request( 'currentMode' );

		return {
			rows: this.getControlValues( 'grid_rows_grid', currentDevice, 'grid-template-rows' ) || 1,
			columns: this.getControlValues( 'grid_columns_grid', currentDevice, 'grid-template-columns' ) || 1,
		};
	}

	setGridOutlineDimensions() {
		const { gridOutline } = this.elements,
			{ rows, columns } = this.getDeviceGridDimensions();

		gridOutline.style.gridTemplateColumns = columns.value;
		gridOutline.style.gridTemplateRows = rows.value;
	}

	/**
	 * Set the control value for the current device.
	 * Distinguish between grid custom values and slider controls.
	 *
	 * @param {string} control - The control name.
	 * @param {string} device - The device mode.
	 * @param {string} property - The CSS property name we need to copy from the parent container.
	 *
	 * @return {Object} - E,g. {value: repeat(2, 1fr), length: 2}.
	 */
	getControlValues( control, device, property ) {
		const elementSettings = this.getElementSettings(),
			{ unit, size } = elementSettings[ control ],
			{ outlineParentContainer } = this.elements,
			controlValueForCurrentDevice = elementorFrontend.utils.controls.getResponsiveControlValue( elementSettings, control, 'size', device ),
			controlValue = this.getComputedStyle( outlineParentContainer, property ),
			computedStyleLength = controlValue.split( ' ' ).length;

		let controlData;

		if ( ( 'custom' === unit && 'string' === typeof controlValueForCurrentDevice ) || size < computedStyleLength ) {
			controlData = { value: controlValue };
		} else {
			// In this case the data is taken from the getComputedStyle and not from the control, in order to handle cases when the user has more elements than grid cells.
			controlData = { value: `repeat(${ computedStyleLength }, 1fr)` };
		}
		controlData = { ...controlData, length: computedStyleLength };

		return controlData;
	}

	getComputedStyle( container, property ) {
		return window?.getComputedStyle( container, null ).getPropertyValue( property );
	}

	onElementChange( propertyName ) {
		let propsThatTriggerGridLayoutRender = [
			'grid_rows_grid',
			'grid_columns_grid',
			'grid_gaps',
			'container_type',
			'boxed_width',
			'content_width',
			'width',
			'height',
			'min_height',
			'padding',
		];

		// Add responsive control names to the list of controls that trigger re-rendering.
		propsThatTriggerGridLayoutRender = this.getResponsiveControlNames( propsThatTriggerGridLayoutRender );

		if ( propsThatTriggerGridLayoutRender.includes( propertyName ) ) {
			this.initLayoutOverlay();
		}
	}

	/**
	 * GetResponsiveControlNames
	 * Add responsive control names to the list of controls that trigger re-rendering.
	 *
	 * @param {Array} propsThatTriggerGridLayoutRender - array of control names.
	 *
	 * @return {Array}
	 */
	getResponsiveControlNames( propsThatTriggerGridLayoutRender ) {
		const activeBreakpoints = elementorFrontend.breakpoints.getActiveBreakpointsList();
		let responsiveControlNames = [];

		for ( const prop of propsThatTriggerGridLayoutRender ) {
			for ( const breakpoint of activeBreakpoints ) {
				responsiveControlNames.push( `${ prop }_${ breakpoint }` );
			}
		}

		responsiveControlNames.push( ...propsThatTriggerGridLayoutRender );

		return responsiveControlNames;
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
