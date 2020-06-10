export default class GlobalControlSelect extends Marionette.Behavior {
	ui() {
		return {
			controlContent: '.elementor-control-content',
		};
	}

	getGlobalValue() {
		return this.view.container.globals.get( this.view.model.get( 'name' ) );
	}

	// This method exists because the UI elements are printed after controls are already rendered
	registerUiElements() {
		const popoverWidget = this.popover.getElements( 'widget' );

		this.ui.globalPreviewsContainer = popoverWidget.find( '.e-global-previews-container' );
		this.ui.globalPreviewItems = popoverWidget.find( '.e-global-preview' );
		this.ui.manageGlobalsButton = popoverWidget.find( '.e-global-manage-button' );
		this.ui.globalControlSelect = this.$el.find( '.e-global-select' );
		this.ui.globalControlSelected = this.$el.find( '.e-global-selected' );
	}

	// This method exists because the UI elements are printed after controls are already rendered
	registerEvents() {
		this.ui.globalPreviewsContainer.on( 'click', '.e-global-preview', async ( event ) => await this.applySavedGlobalValue( event.currentTarget.dataset.globalId ) );
		this.ui.globalControlSelect.on( 'click', ( event ) => this.toggleSelect( event ) );
		this.ui.manageGlobalsButton.on( 'click', () => {
			$e.run( 'panel/global/open' ).then( () => $e.route( 'panel/global/colors-and-typography' ) );
			this.popover.hide();
		} );
	}

	async applySavedGlobalValue( globalId ) {
		this.setGlobalValue( globalId );

		const globalMeta = this.view.getGlobalMeta(),
			globalResult = await $e.data.get( globalMeta.commandName, { id: globalId } ),
			globalData = globalResult.data;

		// TODO: HANDLE CASE WHERE GLOBAL IS NOT FOUND (e.g. WAS DELETED)
		if ( this.view.$el.hasClass( 'e-no-value-color' ) ) {
			this.view.$el.removeClass( 'e-no-value-color' );
		}

		if ( this.view.updateClassGlobalValue ) {
			this.view.updateClassGlobalValue( globalData.value );
		}

		if ( this.view.setGlobalDisplay ) {
			this.view.setGlobalDisplay();
		}

		this.view.setOptions( 'addButtonActive', false );
		this.view.setOptions( 'clearButtonActive', true );

		this.toggleSelect();
	}

	onValueTypeChange() {
		this.updateSelectBoxText();
	}

	updateSelectBoxText() {
		const value = this.view.getControlValue(),
			globalValue = this.getGlobalValue();

		let selectBoxText = '';

		if ( globalValue ) {
			// If there is a global value saved, get the global's name and display it
			$e.data.get( globalValue )
				.then( ( result ) => this.ui.globalControlSelected.html( result.data.title ) );
		} else if ( value ) {
			// If there is a value and it is not a global
			selectBoxText = elementor.translate( 'custom' );
		} else {
			// If there is no value, set the text as default
			selectBoxText = elementor.translate( 'default' );
		}

		this.ui.globalControlSelected.html( selectBoxText );
	}

	// The Global Control elements are initialized onRender and not with initialize() because their position depends
	// on elements that are not yet rendered when initialize() is called.
	onRender() {
		this.printGlobalSelectBox();

		this.initGlobalPopover();

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
		const $popover = jQuery( '<div>', { class: 'e-global-popover-container' } ),
			$popoverTitle = jQuery( '<div>', { class: 'e-global-popover-title' } )
				.html( '<i class="eicon-info-circle"></i>' + this.getOption( 'popoverTitle' ) ),
			$manageGlobalPresetsLink = jQuery( '<div>', { class: 'e-global-manage-button' } )
				.html( this.getOption( 'manageButtonText' ) + '<i class="eicon-cog"></i>' );

		$popover.append( $popoverTitle, $manageGlobalPresetsLink );

		return $popover;
	}

	printGlobalSelectBox() {
		const $globalSelectBox = jQuery( '<div>', { class: 'e-global-select' } ),
			$selectedGlobal = jQuery( '<span>', { class: 'e-global-selected' } )
				.html( elementor.translate( 'default' ) );

		$globalSelectBox.append( $selectedGlobal, '<i class="eicon-caret-down"></i>' );

		this.$el.find( '.elementor-control-input-wrapper' ).prepend( $globalSelectBox );
	}

	initGlobalPopover() {
		this.popover = elementorCommon.dialogsManager.createWidget( 'simple', {
			className: 'e-global-control-popover',
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

		// Render the list of globals and append them to the Globals popover
		// TODO: FIND BEST WAY TO CACHE THE GLOBALS LIST SO THE DB FETCH RUNS ONLY ONCE ON PAGE LOAD
		this.view.getGlobalsList()
			.then(
			( globalsList ) => {
				this.addGlobalsListToPopover( globalsList );

				this.registerUiElementsAndEvents();

				const globalValue = this.getGlobalValue();

				// If there is a global value applied to the control, set the global select box text to display its name
				if ( globalValue ) {
					this.updateSelectBoxText();
				}
			},
			() => {
				// TODO: What happens if the request fails??
			} );

		this.createGlobalInfoTooltip();
	}

	addGlobalsListToPopover( globalsList ) {
		const $globalsList = this.view.buildGlobalsList( globalsList );

		this.popover.getElements( 'widget' ).find( '.e-global-popover-title' ).after( $globalsList );
	}

	registerUiElementsAndEvents() {
		// Instead of ui()
		this.registerUiElements();

		// Instead of events()
		this.registerEvents();
	}

	// This method is not called directly, but triggered by Marionette's .triggerMethod(),
	// in the onAddGlobalButtonClick() method in the color and typography global controls
	onAddGlobalToList( $confirmMessage ) {
		this.confirmNewGlobalModal = elementorCommon.dialogsManager.createWidget( 'confirm', {
			className: 'e-global-confirm-add',
			headerMessage: this.getOption( 'newGlobalConfirmTitle' ),
			message: $confirmMessage,
			strings: {
				confirm: elementor.translate( 'create' ),
				cancel: elementor.translate( 'cancel' ),
			},
			hide: {
				onBackgroundClick: false,
			},
			onConfirm: () => {
				const globalMeta = this.view.getGlobalMeta();

				globalMeta.title = this.globalNameInput.val();

				this.createNewGlobal( globalMeta )
					.then( ( result ) => {
						const $globalPreview = this.view.createGlobalItemMarkup( result.data );

						this.ui.globalPreviewsContainer.append( $globalPreview );
					} );
			},
			onShow: () => {
				// If the control creating the new global has an open popover, make sure it closes when the modal appears
				if ( this.view.hidePopover ) {
					this.view.hidePopover();
				}

				// Put focus on the naming input
				this.globalNameInput = this.confirmNewGlobalModal.getElements( 'widget' ).find( 'input' ).focus();
			},
		} );

		this.confirmNewGlobalModal.show();
	}

	createNewGlobal( globalMeta ) {
		const container = this.view.container;

		return $e.run( globalMeta.commandName + '/create', {
			container,
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

		if ( this.getGlobalValue() ) {
			// If a global text style is already active, switch them without disabling globals
			command = 'document/globals/settings';
		} else {
			// If the active text style is NOT a global, enable globals and apply the selected global
			command = 'document/globals/enable';

			// If the control didn't have a global active, and the control has a toggle button (e.g. group controls),
			// make sure activating the global disables the control's toggle.
			if ( this.view.resetControlValue ) {
				this.view.resetControlValue();
			}
		}

		// colors / typography
		settings[ this.view.model.get( 'name' ) ] = this.view.getCommand() + '?id=' + globalId;

		// Trigger async render.
		$e.run( command, {
			container: this.view.options.container,
			settings: settings,
		} );

		this.onValueTypeChange(); // control value still old.
	}

	// The unset method is triggered from the controls via triggerMethod
	onUnsetGlobalValue() {
		const globalData = this.view.getGlobalMeta(),
			settings = {};

		settings[ globalData.key ] = '';

		$e.run( 'document/globals/disable', {
			container: this.view.container,
			settings: settings,
		} )
			.then( () => {
				this.updateSelectBoxText();
				this.view.setOptions( 'addButtonActive', false );
			} );
	}

	createGlobalInfoTooltip() {
		const $infoIcon = this.popover.getElements( 'widget' ).find( '.e-global-popover-title .eicon-info-circle' );

		this.globalInfoTooltip = elementorCommon.dialogsManager.createWidget( 'simple', {
			className: 'e-global-info-tooltip',
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
