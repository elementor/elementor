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
		this.ui.globalPreviewItems.on( 'click', ( event ) => this.applySavedGlobalValue( JSON.parse( event.currentTarget.dataset.elementorGlobal ) ) );
		this.ui.globalControlSelect.on( 'click', ( event ) => this.toggleSelect( event ) );
		this.ui.manageGlobalsButton.on( 'click', () => {
			$e.run( 'panel/global/open' ).then( () => $e.route( 'panel/global/colors-and-typography' ) );
		} );
	}

	applySavedGlobalValue( globalData ) {
		this.setGlobalValue( globalData );

		// TODO: HANDLE CASE WHERE GLOBAL IS NOT FOUND (e.g. WAS DELETED)

		if ( this.view.$el.hasClass( 'e-invalid-color' ) ) {
			this.view.$el.removeClass( 'e-invalid-color' );
		}

		this.ui.globalControlSelected.html( globalData.name );

		this.toggleSelect();
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
		this.view.getGlobalsList()
			.then(
			( globalsList ) => {
				this.addGlobalsListToPopover( globalsList );
			},
			() => {
				// TODO: What happens if the request fails??
			} )
			.finally( () => this.registerUiElementsAndEvents() );

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
				const globalData = this.view.getGlobalData();

				globalData.name = this.globalNameInput.val();

				$e.run( globalData.commandName + '/create', {
					container: elementor.getCurrentElement().getContainer(),
					setting: globalData.key, // group control name
					title: globalData.name,
				} );

				const $globalPreview = this.view.createGlobalItemMarkup( globalData );

				this.ui.globalPreviewsContainer.append( $globalPreview );

				this.applySavedGlobalValue( globalData );
			},
			onShow: () => {
				// Put focus on the naming input
				this.globalNameInput = this.confirmNewGlobalModal.getElements( 'widget' ).find( 'input' ).focus();
			},
		} );

		this.confirmNewGlobalModal.show();
	}

	setGlobalValue( globalData ) {
		let command = '';
		const settings = {};

		if ( this.getGlobalValue() ) {
			// If a global text style is already active, switch them without disabling globals
			command = 'document/globals/settings';
		} else {
			// If the active text style is NOT a global, enable globals and apply the selected global
			command = 'document/globals/enable';
		}

		// colors / typography
		settings[ globalData.key ] = this.view.getCommand() + '?id=' + globalData.id;

		$e.run( command, {
			container: elementor.getCurrentElement().getContainer(),
			settings: settings,
		} );
	}

	unsetGlobalValue() {
		const globalData = this.view.getGlobalData(),
			settings = {};

		settings[ globalData.key ] = '';

		$e.run( 'document/globals/disable', {
			container: elementor.getCurrentElement().getContainer(),
			settings: settings,
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
