export default class GridOutline extends elementorModules.frontend.handlers.Base {
	isActive() {
		return elementorFrontend.isEditMode();
	}

	getDefaultSettings() {
		return {
			selectors: {
				container: '.elementor-element-editable',
				gridOverlay: '.e-grid-outline',
				directChildGridOverlay: ':scope > .e-grid-outline',
			},
			classes: {
				overlay: 'e-grid-outline',
				overlayItem: 'e-grid-outline-item',
				container: 'elementor-element-editable',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			container = this.$element[ 0 ];

		return {
			container,
			gridOverlay: container.querySelector( selectors.gridOverlay ),
			directChildGridOverlay: container.querySelector( selectors.directChildGridOverlay ),
		};
	}

	onInit() {
		super.onInit();

		this.addLayoutOverlay();
	}

	bindEvents() {
		elementor.listenTo( elementor.channels.deviceMode, 'change', () => this.onDeviceModeChange() );

		this.addChildLifeCycleEventListeners();
	}

	unbindEvents() {
		this.removeChildLifeCycleEventListeners();
	}

	addLayoutOverlay() {
		const container = this.getContainer();

		if ( ! container ) {
			return;
		}

		this.removeExistingOverlay( container );
		this.createOverlayParentContainer( container );
	}

	getContainer() {
		const elementSettings = this.getElementSettings();

		if ( elementSettings.grid_outline && '' !== elementSettings.grid_outline ) {
			return this.getCorrectContainer( elementSettings, this.elements.container );
		}
	}

	removeExistingOverlay( container ) {
		if ( container.querySelector( ':scope > .e-grid-outline' ) ) {
			container.querySelector( ':scope > .e-grid-outline' ).remove();
		}
	}

	createOverlayParentContainer( container ) {
		const gridOverlayContainer = document.createElement( 'div' );

		gridOverlayContainer.classList.add( 'e-grid-outline' );
		container.appendChild( gridOverlayContainer );

		this.createOverlayChildCells( gridOverlayContainer, container );
	}

	createOverlayChildCells( gridOverlayContainer, container ) {
		const containerChildren = container.querySelectorAll( ':scope >.elementor-element' ),
			numberOfChildrenInContainer = containerChildren.length,
			calculatedCellsInGrid = this.calculateNumberOfItemsInGrid(),
			numberOfCells = calculatedCellsInGrid >= numberOfChildrenInContainer
				? calculatedCellsInGrid
				: this.calculateNumberOfItemsInGridByInnerElements( gridOverlayContainer, numberOfChildrenInContainer );

		for ( let i = 0; i < numberOfCells; i++ ) {
			const cell = document.createElement( 'div' );

			cell.classList.add( 'e-grid-outline-item' );
			// cell.style.height = this.getComputedStyle( containerChildren[ i ], 'height' );
			gridOverlayContainer.append( cell );
		}
	}

	calculateNumberOfItemsInGrid() {
		const gridDimensions = this.getGridDimensions();

		return gridDimensions.currentDeviceGridColumns * gridDimensions.currentDeviceGridRows;
	}

	calculateNumberOfItemsInGridByInnerElements( gridOverlayContainer, numberOfElements ) {
		const gridDimensions = this.getGridDimensions();
		let numberOfCells = numberOfElements;

		while ( numberOfCells % gridDimensions.currentDeviceGridColumns !== 0 ) {
			numberOfCells++;
		}

		const numberOfRows = numberOfCells / gridDimensions.currentDeviceGridColumns;
		gridOverlayContainer.style.gridTemplateRows = `repeat( ${ numberOfRows } , 1fr)`;

		return numberOfCells;
	}

	getCorrectContainer() {
		const { container } = this.elements;

		return container.querySelector( ':scope > .e-con-inner' ) || container;
	}

	onElementChange( propertyName ) {
		let propsThatTriggerGridLayoutRender = [
			'grid_rows_grid',
			'grid_columns_grid',
			'container_type',
		];

		// Add responsive props.
		propsThatTriggerGridLayoutRender = this.getResponsiveControlNames( propsThatTriggerGridLayoutRender );

		if ( propsThatTriggerGridLayoutRender.includes( propertyName ) ) {
			this.addLayoutOverlay();
		}
	}

	getResponsiveControlNames( propsThatTriggerGridLayoutRender ) {
		propsThatTriggerGridLayoutRender.forEach( ( prop ) => {
			this.getActiveBreakpointsList().forEach( ( breakpoint ) => {
				propsThatTriggerGridLayoutRender.push( prop + '_' + breakpoint );
			} );
		} );

		return propsThatTriggerGridLayoutRender;
	}

	getGridDimensions() {
		const currentDevice = elementor.channels.deviceMode.request( 'currentMode' );

		return {
			currentDeviceGridColumns: elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'grid_columns_grid', 'size', currentDevice ) || 0,
			currentDeviceGridRows: elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'grid_rows_grid', 'size', currentDevice ) || 0,
		};
	}

	getActiveBreakpointsList() {
		return elementorFrontend.breakpoints.getActiveBreakpointsList();
	}

	onDeviceModeChange() {
		// document.querySelectorAll( '.e-grid-outline' ).forEach( ( gridOutline ) => {
		// 	gridOutline.remove();
		// } );

		this.addLayoutOverlay();
	}

	/**
	 * Rerender Grid Overlay when child element is added or removed from its parent.
	 *
	 * @return {void}
	 */
	addChildLifeCycleEventListeners() {
		this.lifecycleChangeListener = this.addLayoutOverlay.bind( this );

		window.addEventListener( 'elementor/editor/element-rendered', this.lifecycleChangeListener );
		window.addEventListener( 'elementor/editor/element-destroyed', this.lifecycleChangeListener );
	}

	removeChildLifeCycleEventListeners() {
		window.removeEventListener( 'elementor/editor/element-rendered', this.lifecycleChangeListener );
		window.removeEventListener( 'elementor/editor/element-destroyed', this.lifecycleChangeListener );
	}

	getComputedStyle( container, property ) {
		return window.getComputedStyle( container, null ).getPropertyValue( property );
	}
}
