const BOXED = 'boxed';

export default class GridOverlay extends elementorModules.frontend.handlers.Base {
	isActive() {
		return elementorFrontend.isEditMode();
	}

	getDefaultSettings() {
		return {
			selectors: {
				container: '.elementor-element-editable',
				gridOverlay: '.e-grid-overlay',
				directChildGridOverlay: ':scope > .e-grid-overlay',
			},
			classes: {
				overlay: 'e-grid-overlay',
				overlayItem: 'e-grid-overlay-item',
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
		if ( container.querySelector( ':scope > .e-grid-overlay' ) ) {
			container.querySelector( ':scope > .e-grid-overlay' ).remove();
		}
	}

	createOverlayParentContainer( container ) {
		const gridOverlayContainer = document.createElement( 'div' );

		// gridOverlayContainer.style.gridTemplateColumns = this.getComputedStyle( container, 'grid-template-columns' );
		gridOverlayContainer.classList.add( 'e-grid-overlay' );
		container.appendChild( gridOverlayContainer );

		this.createOverlayChildCells( gridOverlayContainer, container );
	}

	createOverlayChildCells( gridOverlayContainer, container ) {
		const numberOfElementsInCurrentContainer = container.querySelectorAll( ':scope >.elementor-element' ).length,
			calculatedCellsInGrid = this.calculateNumberOfItemsInGrid(),
			numberOfCells = calculatedCellsInGrid >= numberOfElementsInCurrentContainer
				? calculatedCellsInGrid
				: this.calculateNumberOfItemsInGridByInnerElements( gridOverlayContainer, numberOfElementsInCurrentContainer );

		for ( let i = 0; i < numberOfCells; i++ ) {
			const cell = document.createElement( 'div' );

			cell.classList.add( 'e-grid-overlay-item' );
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

	getCorrectContainer( elementSettings ) {
		let correctContainer;

		if ( BOXED === elementSettings.content_width ) {
			correctContainer = this.elements.container.querySelector( ':scope > .e-con-inner' );
		} else {
			correctContainer = this.elements.container;
		}

		return correctContainer;
	}

	onElementChange( propertyName ) {
		// Maybe it better to separate responsive control from the rest of the controls
		const propsThatTriggerGridLayoutCalculation = [
			'grid_rows_grid',
			'grid_columns_grid',
			'container_type',
		];

		const allPropsThatTriggerGridLayoutCalculation = this.getResponsiveControlNames( propsThatTriggerGridLayoutCalculation );

		if ( allPropsThatTriggerGridLayoutCalculation.includes( propertyName ) ) {
			this.addLayoutOverlay();
		}
	}

	getResponsiveControlNames( propsThatTriggerGridLayoutCalculation ) {
		propsThatTriggerGridLayoutCalculation.forEach( ( prop ) => {
			this.getActiveBreakpointsList().forEach( ( breakpoint ) => {
				propsThatTriggerGridLayoutCalculation.push( prop + '_' + breakpoint );
			} );
		} );

		return propsThatTriggerGridLayoutCalculation;
	}

	getGridDimensions() {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();

		return {
			currentDeviceGridColumns: elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'grid_columns_grid', 'size', currentDevice ) || 0,
			currentDeviceGridRows: elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'grid_rows_grid', 'size', currentDevice ) || 0,
		};
	}

	getActiveBreakpointsList() {
		return elementorFrontend.breakpoints.getActiveBreakpointsList();
	}

	onDeviceModeChange() {
		this.addLayoutOverlay();
	}

	getCurrentDevice() {
		return elementorFrontend.getCurrentDeviceMode();
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
