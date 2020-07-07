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
		this.ui.globalControlSelect.on( 'click', ( event ) => this.toggleSelect( event ) );
		this.ui.manageGlobalsButton.on( 'click', () => {
			$e.run( 'panel/global/open' ).then( () => $e.route( 'panel/global/colors-and-typography' ) );
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

	applySavedGlobalValue( globalId ) {
		this.setGlobalValue( globalId );

		this.fetchGlobalValue();

		this.popover.hide();
	}

	// Update the behavior's components.
	onValueTypeChange() {
		this.updateSelectBoxText();
	}

	updateSelectBoxText( value ) {
		if ( ! this.ui.globalControlSelected ) {
			return;
		}

		let selectBoxText = '';

		if ( value ) {
			selectBoxText = value;
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

						this.updateSelectBoxText( text );
					} );

				return;
			} else if ( value ) {
				// If there is a value and it is not a global, set the text to custom.
				selectBoxText = elementor.translate( 'custom' );
			} else {
				// If there is no value, set the text as default.
				selectBoxText = elementor.translate( 'default' );
			}
		}

		this.ui.globalControlSelected.html( selectBoxText );
	}

	// The Global Control elements are initialized onRender and not with initialize() because their position depends
	// on elements that are not yet rendered when initialize() is called.
	onRender() {
		this.printGlobalSelectBox();

		this.initGlobalPopover();

		if ( this.view.getGlobalKey() ) {
			// This setTimeout is here to overcome an issue with a requestAnimationFrame that runs in the Pickr library.
			setTimeout( () => this.fetchGlobalValue(), 50 );
		} else {
			this.onValueTypeChange();
		}

		this.$el.addClass( 'elementor-control-global' );
	}

	toggleSelect() {
		if ( this.popover.isVisible() ) {
			this.popover.hide();
		} else {
			this.popover.show();
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

	printGlobalSelectBox() {
		const $globalSelectBox = jQuery( '<div>', { class: 'e-global__select-box' } ),
			$selectedGlobal = jQuery( '<span>', { class: 'e-global__select-box-text' } )
				.html( elementor.translate( 'default' ) );

		$globalSelectBox.append( $selectedGlobal, '<i class="eicon-caret-down"></i>' );

		this.$el.find( '.elementor-control-input-wrapper' ).prepend( $globalSelectBox );

		this.ui.globalControlSelect = $globalSelectBox;
		this.ui.globalControlSelected = $selectedGlobal;
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
