export default class GlobalControlSelect extends Marionette.Behavior {
	ui() {
		return {
			controlContent: '.elementor-control-content',
		};
	}

	// This method exists because the UI elements are printed after controls are already rendered.
	registerUiElements() {
		const popoverWidget = this.popover.getElements( 'widget' );

		this.ui.globalPreviewsContainer = popoverWidget.find( '.e-global__preview-items-container' );
		this.ui.globalPreviewItems = popoverWidget.find( '.e-global__preview-item' );
		this.ui.manageGlobalsButton = popoverWidget.find( '.e-global__manage-button' );
	}

	// This method exists because the UI elements are printed after controls are already rendered.
	registerEvents() {
		this.ui.globalPreviewsContainer.on( 'click', '.e-global__preview-item', ( event ) => this.applySavedGlobalValue( event.currentTarget.dataset.globalId ) );
		this.ui.globalPopoverToggle.on( 'click', ( event ) => this.toggleGlobalPopover( event ) );
		this.ui.manageGlobalsButton.on( 'click', () => {
			const { route } = this.view.getGlobalMeta(),
				args = {
					route: $e.routes.getHistory( 'panel' ).reverse()[ 0 ].route,
					container: this.view.options.container,
				};

			$e.run( 'panel/global/open', args ).then( () => $e.route( route ) );

			this.popover.hide();
		} );
	}

	fetchGlobalValue() {
		return $e.data.get( this.view.getGlobalKey() )
			.then( ( globalData ) => {
				this.view.globalValue = globalData.data.value;

				this.onValueTypeChange();

				this.view.applySavedValue();

				return globalData.data;
			} );
	}

	setCurrentActivePreviewItem() {
		const selectedClass = 'e-global__preview-item--selected';

		if ( this.activePreviewItem ) {
			this.activePreviewItem.removeClass( selectedClass );
		}

		// If there is an active global on the control, get it.
		let globalKey = this.view.getGlobalKey();

		// If there is no active global, check if there is a default global.
		if ( ! globalKey && elementor.config.globals.defaults_enabled[ this.view.getGlobalMeta().controlType ] ) {
			globalKey = this.view.model.get( 'global' )?.default;
		}

		if ( ! globalKey ) {
			// If there is no active global or global default, reset the active preview item.
			this.activePreviewItem = null;

			return;
		}

		// Extract the Global's ID from the Global key
		const { args } = $e.data.commandExtractArgs( globalKey ),
			globalId = args.query.id;

		// Get the active global's corresponding preview item in the Global Select Popover
		const $item = this.ui.globalPreviewItems.filter( `[data-global-id="${ globalId }"]` );

		if ( ! $item ) {
			return;
		}

		this.activePreviewItem = $item;

		this.activePreviewItem.addClass( selectedClass );
	}

	applySavedGlobalValue( globalId ) {
		this.setGlobalValue( globalId );

		this.fetchGlobalValue();

		this.popover.hide();
	}

	// Update the behavior's components.
	onValueTypeChange() {
		this.updateCurrentGlobalName();
	}

	updateCurrentGlobalName( value ) {
		let globalTooltipText = '';

		if ( value ) {
			globalTooltipText = value;
		} else {
			value = this.view.getControlValue();

			let globalValue = this.view.getGlobalKey();

			if ( ! globalValue && ! value && elementor.config.globals.defaults_enabled[ this.view.getGlobalMeta().controlType ] ) {
				globalValue = this.view.model.get( 'global' )?.default;
			}

			if ( globalValue ) {
				// If there is a global value saved, get the global's name and display it.
				$e.data.get( globalValue )
					.then( ( result ) => {
						let text = '';

						if ( result.data.title ) {
							text = result.data.title;
						} else {
							text = elementor.translate( 'default' );
						}

						this.updateCurrentGlobalName( text );
					} );

				this.ui.globalPopoverToggle.addClass( 'e-global__popover-toggle--active' );

				return;
			} else if ( value ) {
				// If there is a value and it is not a global, set the text to custom.
				globalTooltipText = elementor.translate( 'custom' );
			} else {
				// If there is no value, set the text as default.
				globalTooltipText = elementor.translate( 'default' );
			}

			// If there is no value, remove the 'active' class from the Global Toggle button.
			this.ui.globalPopoverToggle.removeClass( 'e-global__popover-toggle--active' );
		}

		// This is used in the Global Toggle Button's tooltip.
		this.globalName = globalTooltipText;
	}

	// The Global Control elements are initialized onRender and not with initialize() because their position depends
	// on elements that are not yet rendered when initialize() is called.
	onRender() {
		this.printGlobalToggleButton();

		this.initGlobalPopover();

		if ( this.view.getGlobalKey() ) {
			// This setTimeout is here to overcome an issue with a requestAnimationFrame that runs in the Pickr library.
			setTimeout( () => this.fetchGlobalValue(), 50 );
		} else {
			this.onValueTypeChange();
		}

		this.$el.addClass( 'e-control-global' );
	}

	toggleGlobalPopover() {
		if ( this.popover.isVisible() ) {
			this.popover.hide();
		} else {
			this.popover.show();

			this.setCurrentActivePreviewItem();
		}
	}

	buildGlobalPopover() {
		const $popover = jQuery( '<div>', { class: 'e-global__popover-container' } ),
			$popoverTitle = jQuery( '<div>', { class: 'e-global__popover-title' } )
				.html( '<div class="e-global__popover-info"><i class="eicon-info-circle"></i></div>' + this.getOption( 'popoverTitle' ) ),
			$manageGlobalPresetsLink = jQuery( '<div>', { class: 'e-global__manage-button' } )
				.html( '<span class="e-global__manage-button__text">' + this.getOption( 'manageButtonText' ) + '</span>' + '<i class="eicon-cog"></i>' );

		$popover.append( $popoverTitle, $manageGlobalPresetsLink );

		return $popover;
	}

	printGlobalToggleButton() {
		const $globalToggleButton = jQuery( '<div>', { class: 'e-global__popover-toggle elementor-control-unit-1' } ),
			$globalPopoverToggleIcon = jQuery( '<i>', { class: 'eicon-globe' } );

		$globalToggleButton.append( $globalPopoverToggleIcon );

		this.$el.find( '.elementor-control-input-wrapper' ).prepend( $globalToggleButton );

		this.ui.globalPopoverToggle = $globalToggleButton;
		this.ui.globalPopoverToggleIcon = $globalPopoverToggleIcon;

		// Add tooltip to the Global Popover toggle button, displaying the current Global Name / 'Default' / 'Custom'.
		this.ui.globalPopoverToggleIcon.tipsy( {
			title: () => {
				return this.globalName;
			},
			offset: 7,
			gravity: () => 's',
		} );
	}

	initGlobalPopover() {
		this.popover = elementorCommon.dialogsManager.createWidget( 'simple', {
			className: 'e-global__popover',
			message: this.buildGlobalPopover(),
			effects: {
				show: 'show',
				hide: 'hide',
			},
			hide: {
				onOutsideClick: false,
			},
			position: {
				my: `center top`,
				at: `center bottom+5`,
				of: this.ui.controlContent,
				autoRefresh: true,
			},
		} );

		// Render the list of globals and append them to the Globals popover.
		this.view.getGlobalsList()
			.then(
			( globalsList ) => {
				this.addGlobalsListToPopover( globalsList );

				this.registerUiElementsAndEvents();
			} );

		this.createGlobalInfoTooltip();
	}

	addGlobalsListToPopover( globalsList ) {
		const $globalsList = this.view.buildGlobalsList( globalsList );

		this.popover.getElements( 'widget' ).find( '.e-global__popover-title' ).after( $globalsList );
	}

	registerUiElementsAndEvents() {
		// Instead of ui()
		this.registerUiElements();

		// Instead of events()
		this.registerEvents();
	}

	// This method is not called directly, but triggered by Marionette's .triggerMethod(),
	// in the onAddGlobalButtonClick() method in the color and typography global controls.
	onAddGlobalToList( $confirmMessage ) {
		this.confirmNewGlobalModal = elementorCommon.dialogsManager.createWidget( 'confirm', {
			className: 'e-global__confirm-add',
			headerMessage: this.getOption( 'newGlobalConfirmTitle' ),
			message: $confirmMessage,
			strings: {
				confirm: elementor.translate( 'create' ),
				cancel: elementor.translate( 'cancel' ),
			},
			hide: {
				onBackgroundClick: false,
			},
			onConfirm: () => this.onConfirmNewGlobal(),
			onShow: () => {
				// Put focus on the naming input.
				this.ui.globalNameInput = this.confirmNewGlobalModal.getElements( 'widget' ).find( 'input' ).focus();
			},
		} );

		this.confirmNewGlobalModal.show();
	}

	onConfirmNewGlobal() {
		const globalMeta = this.view.getGlobalMeta();

		globalMeta.title = this.ui.globalNameInput.val();

		this.createNewGlobal( globalMeta )
			.then( ( result ) => {
				elementor.kitManager.refreshKitCssFiles();

				const $globalPreview = this.view.createGlobalItemMarkup( result.data );

				this.ui.globalPreviewsContainer.append( $globalPreview );
			} );
	}

	createNewGlobal( globalMeta ) {
		return $e.run( globalMeta.commandName + '/create', {
			container: this.view.container,
			setting: globalMeta.key, // group control name
			title: globalMeta.title,
		} )
			.then( ( result ) => {
				this.applySavedGlobalValue( result.data.id );

				return result;
			} );
	}

	setGlobalValue( globalId ) {
		let command = '';
		const settings = {};

		if ( this.view.getGlobalKey() ) {
			// If a global setting is already active, switch them without disabling globals.
			command = 'document/globals/settings';
		} else {
			// If the active setting is NOT a global, enable globals and apply the selected global.
			command = 'document/globals/enable';
		}

		// colors / typography
		settings[ this.view.model.get( 'name' ) ] = this.view.getGlobalCommand() + '?id=' + globalId;

		// Trigger async render.
		$e.run( command, {
			container: this.view.options.container,
			settings: settings,
		} );
	}

	// The unset method is triggered from the controls via triggerMethod.
	onUnsetGlobalValue() {
		const globalMeta = this.view.getGlobalMeta();

		$e.run( 'document/globals/disable', {
			container: this.view.container,
			settings: { [ globalMeta.key ]: '' },
			options: { restore: true },
		} )
			.then( () => {
				this.onValueTypeChange();

				this.view.globalValue = null;
			} );
	}

	onUnlinkGlobalDefault() {
		const globalMeta = this.view.getGlobalMeta();

		$e.run( 'document/globals/unlink', {
			container: this.view.container,
			globalValue: this.view.model.get( 'global' ).default,
			setting: globalMeta.key,
			options: { external: true },
		} )
			.then( () => {
			this.onValueTypeChange();

			this.view.globalValue = null;
		} );
	}

	createGlobalInfoTooltip() {
		const $infoIcon = this.popover.getElements( 'widget' ).find( '.e-global__popover-info' );

		this.globalInfoTooltip = elementorCommon.dialogsManager.createWidget( 'simple', {
			className: 'e-global__popover-info-tooltip',
			message: this.getOption( 'tooltipText' ),
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				my: `left bottom`,
				at: `left top+9`,
				of: this.popover.getElements( 'widget' ),
				autoRefresh: true,
			},
		} );

		$infoIcon.on( {
			mouseenter: () => this.globalInfoTooltip.show(),
			mouseleave: () => this.globalInfoTooltip.hide(),
		} );
	}
}
