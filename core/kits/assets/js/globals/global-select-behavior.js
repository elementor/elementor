export default class GlobalControlSelect extends Marionette.Behavior {
	getClassNames() {
		return {
			previewItemsContainer: 'e-global__preview-items-container',
			previewItem: 'e-global__preview-item',
			selectedPreviewItem: 'e-global__preview-item--selected',
			manageButton: 'e-global__manage-button',
			popover: 'e-global__popover',
			popoverToggle: 'e-global__popover-toggle',
			popoverToggleActive: 'e-global__popover-toggle--active',
			controlGlobal: 'e-control-global',
			globalPopoverContainer: 'e-global__popover-container',
			globalPopoverTitle: 'e-global__popover-title',
			globalPopoverTitleText: 'e-global__popover-title-text',
			globalPopoverInfo: 'e-global__popover-info',
			globalPopoverInfoTooltip: 'e-global__popover-info-tooltip',
			confirmAddNewGlobal: 'e-global__confirm-add',
			confirmMessageText: '.e-global__confirm-message-text',
		};
	}

	// This method exists because the UI elements are printed after controls are already rendered.
	registerUiElements() {
		const popoverWidget = this.popover.getElements( 'widget' );

		this.ui.manageGlobalsButton = popoverWidget.find( `.${ this.getClassNames().manageButton }` );
	}

	registerPreviewElements() {
		const popoverWidget = this.popover.getElements( 'widget' ),
			classes = this.getClassNames();

		this.ui.globalPreviewItems = popoverWidget.find( `.${ classes.previewItem }` );
	}

	// This method exists because the UI elements are printed after controls are already rendered.
	registerEvents() {
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

	addPreviewItemsClickListener() {
		this.ui.$globalPreviewItemsContainer.on( 'click', `.${ this.getClassNames().previewItem }`, ( event ) => this.applySavedGlobalValue( event.currentTarget.dataset.globalId ) );
	}

	fetchGlobalValue() {
		return $e.data.get( this.view.getGlobalKey() )
			.then( ( globalData ) => {
				this.view.globalValue = globalData.data.value;

				this.onValueTypeChange();

				elementor.kitManager.renderGlobalVariables();

				this.view.applySavedValue();

				return globalData.data;
			} ).catch( ( e ) => {
				// TODO: Need to be replaced by "e instanceof NotFoundError"
				if ( 404 !== e?.data?.status ) {
					return Promise.reject( e );
				}

				this.disableGlobalValue( false );
			} );
	}

	setCurrentActivePreviewItem() {
		const selectedClass = this.getClassNames().selectedPreviewItem,
			defaultGlobalsAreEnabled = elementor.config.globals.defaults_enabled[ this.view.getGlobalMeta().controlType ];

		if ( this.activePreviewItem ) {
			this.resetActivePreviewItem();
		}

		// If there is an active global on the control, get it.
		let globalKey = this.view.getGlobalKey();

		// If the control has no active global and no active custom value, check if there is a default global and use it.
		if ( ! globalKey && ! this.view.getControlValue() && defaultGlobalsAreEnabled ) {
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

	resetActivePreviewItem() {
		if ( this.activePreviewItem ) {
			this.activePreviewItem.removeClass( this.getClassNames().selectedPreviewItem );
		}

		this.activePreviewItem = null;
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
		const classes = this.getClassNames();

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
							text = __( 'Default', 'elementor' );
						}

						this.updateCurrentGlobalName( text );
					} );

				this.ui.globalPopoverToggle.addClass( classes.popoverToggleActive );

				return;
			} else if ( value ) {
				// If there is a value and it is not a global, set the text to custom.
				globalTooltipText = __( 'Custom', 'elementor' );
			} else {
				// If there is no value, set the text as default.
				globalTooltipText = __( 'Default', 'elementor' );
			}

			// If there is no value, remove the 'active' class from the Global Toggle button.
			this.ui.globalPopoverToggle.removeClass( classes.popoverToggleActive );
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

		this.$el.addClass( this.getClassNames().controlGlobal );
	}

	toggleGlobalPopover() {
		if ( this.popover.isVisible() ) {
			this.popover.hide();
		} else {
			if ( this.ui.$globalPreviewItemsContainer ) {
				// This element is not defined when the controls popover is first loaded.
				this.ui.$globalPreviewItemsContainer.remove();
			}

			this.view.getGlobalsList()
				.then(
					( globalsList ) => {
						// We just deleted the existing list of global preview items, so we need to rebuild it
						// with the updated list of globals, register the elements and re-add the on click listeners.
						this.addGlobalsListToPopover( globalsList );

						this.registerPreviewElements();
						this.addPreviewItemsClickListener();

						this.popover.show();

						this.setCurrentActivePreviewItem();
					} );
		}
	}

	buildGlobalPopover() {
		const classes = this.getClassNames(),
			$popover = jQuery( '<div>', { class: classes.globalPopoverContainer } ),
			$popoverTitle = jQuery( '<div>', { class: classes.globalPopoverTitle } )
				.html( '<div class="' + classes.globalPopoverInfo + '"><i class="eicon-info-circle"></i></div><span class="' + classes.globalPopoverTitleText + '">' + this.getOption( 'popoverTitle' ) + '</span>' ),
			$manageGlobalsLink = jQuery( '<div>', { class: classes.manageButton } )
				.html( '<i class="eicon-cog"></i>' );

		$popoverTitle.append( $manageGlobalsLink );

		$popover.append( $popoverTitle );

		this.manageButtonTooltipText = this.getOption( 'manageButtonText' );

		$manageGlobalsLink.tipsy( {
			title: () => {
				return this.manageButtonTooltipText;
			},
			offset: 3,
			gravity: () => 's',
		} );

		return $popover;
	}

	printGlobalToggleButton() {
		const $globalToggleButton = jQuery( '<div>', { class: this.getClassNames().popoverToggle + ' elementor-control-unit-1' } ),
			$globalPopoverToggleIcon = jQuery( '<i>', { class: 'eicon-globe' } ),
			$globalsLoadingSpinner = jQuery( '<span>', { class: 'elementor-control-spinner' } )
				.html( '<i class="eicon-spinner eicon-animation-spin"></i></span>' );

		$globalToggleButton.append( $globalPopoverToggleIcon );

		this.$el.find( '.elementor-control-input-wrapper' ).prepend( $globalToggleButton );

		this.ui.globalPopoverToggle = $globalToggleButton;
		this.ui.globalPopoverToggleIcon = $globalPopoverToggleIcon;
		this.ui.$globalsLoadingSpinner = $globalsLoadingSpinner;

		// Add tooltip to the Global Popover toggle button, displaying the current Global Name / 'Default' / 'Custom'.
		this.ui.globalPopoverToggleIcon.tipsy( {
			title: () => {
				return this.globalName;
			},
			offset: 7,
			gravity: () => 's',
		} );

		$globalToggleButton.before( $globalsLoadingSpinner );

		this.ui.$globalsLoadingSpinner.hide();
	}

	initGlobalPopover() {
		this.popover = elementorCommon.dialogsManager.createWidget( 'simple', {
			className: this.getClassNames().popover,
			message: this.buildGlobalPopover(),
			effects: {
				show: 'show',
				hide: 'hide',
			},
			hide: {
				onOutsideClick: false,
			},
			position: {
				my: `right top`,
				at: `right bottom+5`,
				of: this.ui.globalPopoverToggle,
				collision: 'fit flip',
				autoRefresh: true,
			},
		} );

		// Add Popover elements to the this.ui object and register click events.
		this.registerUiElementsAndEvents();

		this.createGlobalInfoTooltip();
	}

	addGlobalsListToPopover( globalsList ) {
		const $globalPreviewItemsContainer = jQuery( '<div>', { class: 'e-global__preview-items-container' } );

		this.view.buildGlobalsList( globalsList, $globalPreviewItemsContainer );

		this.popover.getElements( 'widget' ).find( `.${ this.getClassNames().globalPopoverTitle }` ).after( $globalPreviewItemsContainer );

		// The populated list is nested under the previews container element.
		this.ui.$globalPreviewItemsContainer = $globalPreviewItemsContainer;
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
		const classes = this.getClassNames();

		this.confirmNewGlobalModal = elementorCommon.dialogsManager.createWidget( 'confirm', {
			className: classes.confirmAddNewGlobal,
			headerMessage: this.getOption( 'newGlobalConfirmTitle' ),
			message: $confirmMessage,
			strings: {
				confirm: __( 'Create', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			hide: {
				onBackgroundClick: false,
			},
			onConfirm: () => this.onConfirmNewGlobal(),
			onShow: () => {
				// Put focus on the naming input.
				const modalWidget = this.confirmNewGlobalModal.getElements( 'widget' );

				this.ui.globalNameInput = modalWidget.find( 'input' ).focus();
				this.ui.confirmMessageText = modalWidget.find( classes.confirmMessageText );

				this.ui.globalNameInput.on( 'input', () => this.onAddGlobalConfirmInputChange() );
			},
		} );

		this.confirmNewGlobalModal.show();
	}

	onAddGlobalConfirmInputChange() {
		if ( ! this.view.globalsList ) {
			return;
		}

		let messageContent;

		for ( const globalValue of Object.values( this.view.globalsList ) ) {
			if ( this.ui.globalNameInput.val() === globalValue.title ) {
				messageContent = this.view.getNameAlreadyExistsMessage();
				break;
			} else {
				messageContent = this.view.getConfirmTextMessage();
			}
		}

		this.ui.confirmMessageText.html( messageContent );
	}

	onConfirmNewGlobal() {
		const globalMeta = this.view.getGlobalMeta();

		globalMeta.title = this.ui.globalNameInput.val();

		this.createNewGlobal( globalMeta );
	}

	createNewGlobal( globalMeta ) {
		this.ui.$globalsLoadingSpinner.show();

		$e.run( globalMeta.commandName + '/create', {
			container: this.view.container,
			setting: globalMeta.key, // group control name
			title: globalMeta.title,
		} )
			.then( ( result ) => {
				this.applySavedGlobalValue( result.data.id );

				this.ui.$globalsLoadingSpinner.hide();
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
		this.disableGlobalValue();
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

				this.resetActivePreviewItem();
		} );
	}

	createGlobalInfoTooltip() {
		const classes = this.getClassNames(),
			$infoIcon = this.popover.getElements( 'widget' ).find( `.${ classes.globalPopoverInfo }` );

		this.globalInfoTooltip = elementorCommon.dialogsManager.createWidget( 'simple', {
			className: classes.globalPopoverInfoTooltip,
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

	disableGlobalValue( restore = true ) {
		const globalMeta = this.view.getGlobalMeta();

		return $e.run( 'document/globals/disable', {
			container: this.view.container,
			settings: { [ globalMeta.key ]: '' },
			options: { restore },
		} )
			.then( () => {
				this.onValueTypeChange();

				this.view.globalValue = null;

				this.resetActivePreviewItem();
			} );
	}
}
