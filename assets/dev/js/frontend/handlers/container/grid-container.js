export default class GridContainer extends elementorModules.frontend.handlers.Base {
	static cacheByValues = new Map();

	static isDeviceModeListenerBound = false;

	static bindDeviceModeListener() {
		if ( GridContainer.isDeviceModeListenerBound ) {
			return;
		}

		GridContainer.isDeviceModeListenerBound = true;

		elementor.channels.deviceMode.on( 'change', () => {
			GridContainer.clearCache();
		} );
	}

	static clearCache() {
		GridContainer.cacheByValues.clear();
	}

	static isGridLayoutReady( handler ) {
		return handler.elements?.container?.classList.contains( 'e-grid' );
	}

	static hasValidGridDimensions( dimensions ) {
		return dimensions?.rows?.length > 0 && dimensions?.columns?.length > 0;
	}

	static isDimensionsEntryCacheable( handler, entry ) {
		return GridContainer.isGridLayoutReady( handler ) && GridContainer.hasValidGridDimensions( entry.dimensions );
	}

	static buildCalculationKey( handler ) {
		const device = elementor.channels.deviceMode.request( 'currentMode' ),
			elementSettings = handler.getElementSettings(),
			{ grid_auto_flow: gridAutoFlow } = elementSettings,
			rowsSize = elementorFrontend.utils.controls.getResponsiveControlValue( elementSettings, 'grid_rows_grid', 'size', device ),
			columnsSize = elementorFrontend.utils.controls.getResponsiveControlValue( elementSettings, 'grid_columns_grid', 'size', device ),
			rowsUnit = elementorFrontend.utils.controls.getResponsiveControlValue( elementSettings, 'grid_rows_grid', 'unit', device ),
			columnsUnit = elementorFrontend.utils.controls.getResponsiveControlValue( elementSettings, 'grid_columns_grid', 'unit', device ),
			keyParts = [
				device,
				gridAutoFlow,
				rowsSize,
				rowsUnit,
				columnsSize,
				columnsUnit,
			],
			{ outlineParentContainer } = handler.elements;

		if ( outlineParentContainer ) {
			const columnsValue = handler.getComputedStyle( outlineParentContainer, 'grid-template-columns' ),
				rowsValue = handler.getComputedStyle( outlineParentContainer, 'grid-template-rows' );

			keyParts.push( columnsValue?.trim() ?? '', rowsValue?.trim() ?? '' );
		}

		return keyParts.join( '|' );
	}

	static buildOutlineCacheKey( calculationKey, childrenLength ) {
		return calculationKey + '|children:' + childrenLength;
	}

	static computeMaxElementsNumber( handler, gridDimensions ) {
		const elementSettings = handler.getElementSettings(),
			device = elementor.channels.deviceMode.request( 'currentMode' ),
			{ grid_auto_flow: gridAutoFlow } = elementSettings;

		if ( 'row' === gridAutoFlow ) {
			const rows = elementorFrontend.utils.controls.getResponsiveControlValue( elementSettings, 'grid_rows_grid', 'size', device ),
				rowsLength = isNaN( rows ) ? String( rows ).split( ' ' ).length : rows;

			return gridDimensions.columns.length * rowsLength;
		}

		const columns = elementorFrontend.utils.controls.getResponsiveControlValue( elementSettings, 'grid_columns_grid', 'size', device ),
			columnsLength = isNaN( columns ) ? String( columns ).split( ' ' ).length : columns;

		return gridDimensions.rows.length * columnsLength;
	}

	static computeDimensionsCache( handler ) {
		const currentDevice = elementor.channels.deviceMode.request( 'currentMode' ),
			dimensions = {
				rows: handler.getControlValues( 'grid_rows_grid', currentDevice, 'grid-template-rows' ) || 1,
				columns: handler.getControlValues( 'grid_columns_grid', currentDevice, 'grid-template-columns' ) || 1,
			};

		return {
			dimensions,
			maxElementsNumber: GridContainer.computeMaxElementsNumber( handler, dimensions ),
		};
	}

	static getDimensionsCache( handler ) {
		const calculationKey = GridContainer.buildCalculationKey( handler ),
			cached = GridContainer.cacheByValues.get( calculationKey );

		if ( cached?.dimensions ) {
			return cached;
		}

		const entry = GridContainer.computeDimensionsCache( handler );

		if ( GridContainer.isDimensionsEntryCacheable( handler, entry ) ) {
			GridContainer.cacheByValues.set( calculationKey, entry );
		}

		return entry;
	}

	static getCachedMaxOutlineElementsNumber( handler, childrenLength ) {
		const calculationKey = GridContainer.buildCalculationKey( handler ),
			outlineCacheKey = GridContainer.buildOutlineCacheKey( calculationKey, childrenLength ),
			cachedOutlineCount = GridContainer.cacheByValues.get( outlineCacheKey );

		if ( undefined !== cachedOutlineCount ) {
			return cachedOutlineCount;
		}

		const { dimensions: gridDimensions, maxElementsNumber: maxElementsBySettings } = GridContainer.getDimensionsCache( handler ),
			{ grid_auto_flow: gridAutoFlow } = handler.getElementSettings(),
			flowTypeField = 'row' === gridAutoFlow ? 'columns' : 'rows',
			maxElementsByItems = Math.ceil( childrenLength / gridDimensions[ flowTypeField ].length ) * gridDimensions[ flowTypeField ].length,
			maxOutlineElements = maxElementsBySettings > maxElementsByItems ? maxElementsBySettings : maxElementsByItems,
			dimensionsEntry = { dimensions: gridDimensions, maxElementsNumber: maxElementsBySettings };

		if ( GridContainer.isDimensionsEntryCacheable( handler, dimensionsEntry ) ) {
			GridContainer.cacheByValues.set( outlineCacheKey, maxOutlineElements );
		}

		return maxOutlineElements;
	}

	__construct( settings ) {
		super.__construct( settings );

		this.onDeviceModeChange = this.onDeviceModeChange.bind( this );
		this.updateEmptyViewHeight = this.updateEmptyViewHeight.bind( this );
	}

	isActive() {
		return elementorFrontend.isEditMode();
	}

	getDefaultSettings() {
		const gridItemSuffixes = [
			'_heading_grid_item',
			'_grid_column',
			'_grid_column_custom',
			'_grid_row',
			'_grid_row_custom',
			'heading_grid_item',
			'grid_column',
			'grid_column_custom',
			'grid_row',
			'grid_row_custom',
		];

		const gridItemControls = gridItemSuffixes.map( ( suffix ) => `[class*="elementor-control-${ suffix }"]` ).join( ', ' );

		return {
			selectors: {
				gridOutline: '.e-grid-outline',
				directGridOverlay: ':scope > .e-grid-outline',
				boxedContainer: ':scope > .e-con-inner',
				emptyView: '.elementor-empty-view',
			},
			classes: {
				outline: 'e-grid-outline',
				outlineItem: 'e-grid-outline-item',
				gridItemControls,
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			outlineParentContainer: null,
			gridOutline: this.findElement( selectors.gridOutline ),
			directChildGridOverlay: this.findElement( selectors.directGridOverlay ),
			emptyView: this.findElement( selectors.emptyView )[ 0 ],
			container: this.$element[ 0 ],
		};
	}

	onInit() {
		super.onInit();
		this.scheduleInitLayoutOverlay();
		this.updateEmptyViewHeight();
		elementor.hooks.addAction( 'panel/open_editor/container', this.onPanelShow );
	}

	handleGridControls( sectionName, editor ) {
		const advancedSections = [
			'_section_style', // Widgets
			'section_layout', // Containers
		];

		if ( ! advancedSections.includes( sectionName ) ) {
			return;
		}

		if ( ! this.isItemInGridCell( editor ) ) {
			this.hideGridControls( editor );
		}
	}

	isItemInGridCell( editor ) {
		const container = editor?.getOption( 'editedElementView' )?.getContainer();

		if ( 'function' !== typeof container?.parent?.model?.getSetting ) {
			return false;
		}

		return 'grid' === container?.parent?.model?.getSetting( 'container_type' );
	}

	hideGridControls( editor ) {
		const classes = this.getSettings( 'classes' );
		const gridControls = editor?.el.querySelectorAll( classes.gridItemControls );

		gridControls.forEach( ( element ) => {
			element.style.display = 'none';
		} );
	}

	onPanelShow( panel, model ) {
		const settingsModel = model.get( 'settings' ),
			containerType = settingsModel.get( 'container_type' ),
			$linkElement = panel.$el.find( '#elementor-panel__editor__help__link' ),
			href = 'grid' === containerType
				? 'https://go.elementor.com/widget-container-grid'
				: 'https://go.elementor.com/widget-container';

		if ( $linkElement ) {
			$linkElement.attr( 'href', href );
		}
	}

	bindEvents() {
		GridContainer.bindDeviceModeListener();
		elementor.channels.deviceMode.on( 'change', this.onDeviceModeChange );
		elementorFrontend.elements.$window.on( 'resize', this.onDeviceModeChange );
		elementorFrontend.elements.$window.on( 'resize', this.updateEmptyViewHeight );
		this.addChildLifeCycleEventListeners();
		elementor.channels.editor.on( 'section:activated', this.handleGridControls.bind( this ) );
	}

	onDestroy() {
		elementorModules.frontend.handlers.Base.prototype.onDestroy.apply( this, arguments );
	}

	unbindEvents() {
		this.removeChildLifeCycleEventListeners();
		elementor.channels.deviceMode.off( 'change', this.onDeviceModeChange );
		elementorFrontend.elements.$window.off( 'resize', this.onDeviceModeChange );
		elementorFrontend.elements.$window.off( 'resize', this.updateEmptyViewHeight );
		elementor.channels.editor.off( 'section:activated', this.handleGridControls.bind( this ) );
	}

	initLayoutOverlay() {
		this.getCorrectContainer();
		const selectors = this.getSettings( 'selectors' );

		this.elements.emptyView = this.findElement( selectors.emptyView )[ 0 ];

		const isGridContainer = 'grid' === this.getElementSettings( 'container_type' );

		if ( isGridContainer && this.elements?.emptyView ) {
			this.elements.emptyView.style.display = this.shouldRemoveEmptyView() ? 'none' : 'block';
		}

		this.updateGridOutline();
	}

	updateGridOutline() {
		if ( ! this.shouldDrawOutline() ) {
			this.removeExistingOverlay();
			return;
		}

		const numberOfItems = this.getMaxOutlineElementsNumber(),
			gridOutlineElement = this.getGridOutlineElement();

		if (
			numberOfItems > 0 &&
			gridOutlineElement?.isConnected &&
			gridOutlineElement.parentElement === this.elements.outlineParentContainer &&
			gridOutlineElement.childElementCount === numberOfItems
		) {
			this.setGridOutlineDimensions();
			return;
		}

		this.removeExistingOverlay();
		this.createOverlayContainer();
		this.createOverlayItems();
	}

	shouldDrawOutline() {
		const { grid_outline: gridOutline } = this.getElementSettings();

		return gridOutline;
	}

	getCorrectContainer() {
		const container = this.elements.container,
			getDefaultSettings = this.getDefaultSettings(),
			{ selectors: { boxedContainer } } = getDefaultSettings;

		this.elements.outlineParentContainer = container.querySelector( boxedContainer ) || container;
	}

	getGridOutlineElement() {
		const { gridOutline } = this.elements;

		if ( ! gridOutline ) {
			return null;
		}

		return gridOutline[ 0 ] || gridOutline;
	}

	removeExistingOverlay() {
		this.getGridOutlineElement()?.remove();
		this.elements.gridOutline = null;
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
			numberOfItems = this.getMaxOutlineElementsNumber();
		const gridOutlineItems = [];

		for ( let i = 0; i < numberOfItems; i++ ) {
			const gridOutlineItem = document.createElement( 'div' );
			gridOutlineItem.classList.add( outlineItem );
			gridOutlineItems.push( gridOutlineItem );
		}
		gridOutline.append( ...gridOutlineItems );
	}

	/**
	 * Get the grid dimensions for the current device.
	 *
	 * @return { { columns: { value, length }, rows: { value, length } } }
	 */
	getDeviceGridDimensions() {
		return GridContainer.getDimensionsCache( this ).dimensions;
	}

	setGridOutlineDimensions() {
		const gridOutlineElement = this.getGridOutlineElement(),
			{ rows, columns } = this.getDeviceGridDimensions();

		gridOutlineElement.style.gridTemplateColumns = columns.value;
		gridOutlineElement.style.gridTemplateRows = rows.value;
	}

	/**
	 * Set the control value for the current device.
	 * Distinguish between grid custom values and slider controls.
	 *
	 * @param {string} control  - The control name.
	 * @param {string} device   - The device mode.
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
		if ( this.isControlThatMayAffectEmptyViewHeight( propertyName ) ) {
			this.updateEmptyViewHeight();
		}

		let propsThatTriggerGridLayoutRender = [
			'grid_rows_grid',
			'grid_columns_grid',
			'grid_gaps',
			'grid_outline',
			'container_type',
			'boxed_width',
			'content_width',
			'width',
			'height',
			'min_height',
			'padding',
			'grid_auto_flow',
		];

		// Add responsive control names to the list of controls that trigger re-rendering.
		propsThatTriggerGridLayoutRender = this.getResponsiveControlNames( propsThatTriggerGridLayoutRender );

		if ( propsThatTriggerGridLayoutRender.includes( propertyName ) ) {
			this.scheduleInitLayoutOverlay();
		}
	}

	isControlThatMayAffectEmptyViewHeight( propertyName ) {
		return 0 === propertyName.indexOf( 'grid_rows_grid' ) || 0 === propertyName.indexOf( 'grid_columns_grid' ) || 0 === propertyName.indexOf( 'grid_auto_flow' );
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
		const responsiveControlNames = [];

		for ( const prop of propsThatTriggerGridLayoutRender ) {
			for ( const breakpoint of activeBreakpoints ) {
				responsiveControlNames.push( `${ prop }_${ breakpoint }` );
			}
		}

		responsiveControlNames.push( ...propsThatTriggerGridLayoutRender );

		return responsiveControlNames;
	}

	onDeviceModeChange() {
		this.scheduleInitLayoutOverlay();
	}

	isLifecycleEventAffectingThisContainer( event ) {
		const changedContainer = event.detail?.elementView?.getContainer?.();

		if ( ! changedContainer ) {
			return false;
		}

		const thisModelCid = this.getModelCID();

		if ( changedContainer.model.cid === thisModelCid ) {
			return true;
		}

		const parentContainer = changedContainer.parent;

		return parentContainer && parentContainer.model.cid === thisModelCid;
	}

	onChildLifecycleEvent( event ) {
		if ( ! this.isLifecycleEventAffectingThisContainer( event ) ) {
			return;
		}

		this.scheduleInitLayoutOverlay();
	}

	scheduleInitLayoutOverlay() {
		if ( this.layoutOverlayAnimationFrame ) {
			return;
		}

		this.layoutOverlayAnimationFrame = requestAnimationFrame( () => {
			this.layoutOverlayAnimationFrame = null;
			this.initLayoutOverlay();
		} );
	}

	/**
	 * Rerender Grid Overlay when child element is added or removed from its parent.
	 *
	 * @return {void}
	 */
	addChildLifeCycleEventListeners() {
		this.lifecycleChangeListener = this.onChildLifecycleEvent.bind( this );

		window.addEventListener( 'elementor/editor/element-rendered', this.lifecycleChangeListener );
		window.addEventListener( 'elementor/editor/element-destroyed', this.lifecycleChangeListener );
	}

	removeChildLifeCycleEventListeners() {
		window.removeEventListener( 'elementor/editor/element-rendered', this.lifecycleChangeListener );
		window.removeEventListener( 'elementor/editor/element-destroyed', this.lifecycleChangeListener );

		if ( this.layoutOverlayAnimationFrame ) {
			cancelAnimationFrame( this.layoutOverlayAnimationFrame );
			this.layoutOverlayAnimationFrame = null;
		}
	}

	updateEmptyViewHeight() {
		if ( this.shouldUpdateEmptyViewHeight() ) {
			const { emptyView } = this.elements,
				currentDevice = elementor.channels.deviceMode.request( 'currentMode' ),
				elementSettings = this.getElementSettings(),
				gridRows = 'desktop' === currentDevice ? elementSettings.grid_rows_grid : elementSettings.grid_rows_grid + '_' + currentDevice;

			emptyView?.style.removeProperty( 'min-height' );

			if ( this.hasCustomUnit( gridRows ) && this.isNotOnlyANumber( gridRows ) && this.sizeNotEmpty( gridRows ) ) {
				emptyView.style.minHeight = 'auto';
			}

			// This is to handle cases where `minHeight: auto` computes to `0`.
			if ( emptyView?.offsetHeight <= 0 ) {
				emptyView.style.minHeight = '100px';
			}
		}
	}

	shouldUpdateEmptyViewHeight() {
		return !! this.elements.container.querySelector( '.elementor-empty-view' );
	}

	hasCustomUnit( gridRows ) {
		return 'custom' === gridRows?.unit;
	}

	sizeNotEmpty( gridRows ) {
		return '' !== gridRows?.size?.trim();
	}

	isNotOnlyANumber( gridRows ) {
		const numberPattern = /^\d+$/;

		return ! numberPattern.test( gridRows?.size );
	}

	shouldRemoveEmptyView() {
		const childrenLength = this.elements.outlineParentContainer.querySelectorAll( ':scope > .elementor-element' ).length;

		if ( 0 === childrenLength ) {
			return false;
		}

		const maxElements = this.getMaxElementsNumber();

		return maxElements <= childrenLength && this.isFullFilled( childrenLength );
	}

	isFullFilled( numberOfElements ) {
		const gridDimensions = GridContainer.getDimensionsCache( this ).dimensions,
			{ grid_auto_flow: gridAutoFlow } = this.getElementSettings();

		const flowTypeField = 'row' === gridAutoFlow ? 'columns' : 'rows';

		return 0 === numberOfElements % gridDimensions[ flowTypeField ].length;
	}

	getMaxOutlineElementsNumber() {
		const childrenLength = this.elements.outlineParentContainer.querySelectorAll( ':scope > .elementor-element' ).length;

		return GridContainer.getCachedMaxOutlineElementsNumber( this, childrenLength );
	}

	getMaxElementsNumber() {
		return GridContainer.getDimensionsCache( this ).maxElementsNumber;
	}
}
