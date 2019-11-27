export default class ColorPicker extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.createPicker();
	}

	getColorPickerPalette() {
		return _.pluck( elementor.schemes.getScheme( 'color-picker' ).items, 'value' );
	}

	getDefaultSettings() {
		return {
			picker: {
				theme: 'monolith',
				position: 'bottom-' + ( elementorCommon.config.isRTL ? 'end' : 'start' ),
				components: {
					opacity: true,
					hue: true,
					interaction: {
						input: true,
						clear: true,
					},
				},
				strings: {
					clear: elementor.translate( 'clear' ),
				},
			},
			classes: {
				header: 'elementor-color-picker__header',
				savedColorsTitle: 'elementor-color-picker__saved-colors-title',
				editButton: 'elementor-color-picker__saved-colors-edit',
				swatchTool: 'elementor-color-picker__swatch-tool',
				addSwatch: 'elementor-color-picker__add-swatch',
				droppingArea: 'elementor-color-picker--dropping-area',
				plusIcon: 'eicon-plus',
				trashIcon: 'eicon-trash-o',
				editMode: 'elementor-color-picker--edit-mode',
			},
			selectors: {
				swatch: '.pcr-swatch',
				activeSwatch: '.pcr-active',
			},
		};
	}

	createPicker() {
		const pickerSettings = this.getSettings( 'picker' );

		pickerSettings.default = pickerSettings.default || null;

		this.picker = new Pickr( pickerSettings );

		if ( ! pickerSettings.default ) {
			// Set a default palette. It doesn't affect the selected value
			this.picker.setColor( '#000' );
		}

		this.picker
			.on( 'change', ( ...args ) => this.onPickerChange( ...args ) )
			.on( 'clear', ( ...args ) => this.onPickerClear( ...args ) )
			.on( 'show', () => this.onPickerShow() );

		this.addHeader();

		this.addPlusButton();

		this.addSwatchDroppingArea();

		this.addToolsToSwatches();
	}

	getValue() {
		const color = this.picker.getColor();

		let colorRepresentation;

		if ( 1 === color.a ) {
			colorRepresentation = color.toHEXA();
		} else {
			colorRepresentation = color.toRGBA();
		}

		return colorRepresentation.toString( 0 );
	}

	getSwatches() {
		return jQuery( this.picker.getRoot().swatches );
	}

	addSwatch( color ) {
		const $swatch = jQuery( this.picker.addSwatch( color ) );

		$swatch.html5Draggable( {
			onDragStart: this.onSwatchDragStart.bind( this ),
			onDragEnd: this.onSwatchDragEnd.bind( this ),
		} );
	}

	addSwatches() {
		this.getSwatches().children( this.getSettings( 'selectors.swatch' ) ).remove();

		this.getColorPickerPalette().forEach( ( swatch ) => this.addSwatch( swatch ) );

		this.addToolsToSwatches();
	}

	addHeader() {
		const { classes } = this.getSettings();

		const $header = jQuery( '<div>', { class: classes.header } ),
			$savedColorsTitle = jQuery( '<div>', { class: classes.savedColorsTitle } ).text( elementor.translate( 'saved_colors' ) ),
			$editButton = jQuery( '<div>', { class: classes.editButton } ).text( elementor.translate( 'edit' ) );

		$editButton.on( 'click', () => this.onEditButtonClick() );

		$header.append( $savedColorsTitle, $editButton );

		this.$editButton = $editButton;

		this.getSwatches().before( $header );
	}

	addPlusButton() {
		const { classes } = this.getSettings();

		this.$addButton = jQuery( '<button>', { class: classes.swatchTool + ' ' + classes.addSwatch } ).html( jQuery( '<i>', { class: classes.plusIcon } ) );

		this.$addButton.on( 'click', () => this.onAddButtonClick() );

		this.$addButton.tipsy( {
			title: () => elementor.translate( 'add_picked_color' ),
			gravity: () => 's',
		} );
	}

	addSwatchDroppingArea() {
		const { classes } = this.getSettings();

		this.$droppingArea = jQuery( '<div>', { class: classes.droppingArea } ).html( jQuery( '<i>', { class: classes.trashIcon } ) );

		this.getSwatches().after( this.$droppingArea );

		this.$droppingArea.html5Droppable( {
			items: '',
			onDropping: this.onDroppingAreaDropping.bind( this ),
		} );
	}

	addToolsToSwatches() {
		this.getSwatches().append( this.$addButton );

		this.picker.activateSwatch();
	}

	removeSwatch( index ) {
		elementor.schemes.removeSchemeItem( 'color-picker', index );

		elementor.schemes.saveScheme( 'color-picker' );

		this.picker.removeSwatch( index );
	}

	destroy() {
		this.picker.destroyAndRemove();
	}

	fixTipsyForFF( $button ) {
		// There's a bug in FireFox about hiding the tooltip after the button was clicked,
		// So let's force it to hide
		$button.data( 'tipsy' ).hide();
	}

	onPickerChange( ...args ) {
		this.picker.applyColor();

		const onChange = this.getSettings( 'onChange' );

		if ( onChange ) {
			onChange( ...args );
		}
	}

	onPickerClear( ...args ) {
		const onClear = this.getSettings( 'onClear' );

		if ( onClear ) {
			onClear( ...args );
		}
	}

	onPickerShow() {
		this.addSwatches();

		const { result: resultInput } = this.picker.getRoot().interaction;

		setTimeout( () => {
			resultInput.select();

			this.picker._recalc = true;
		}, 100 );
	}

	onAddButtonClick() {
		const value = this.getValue();

		this.addSwatch( value );

		this.addToolsToSwatches();

		elementor.schemes.addSchemeItem( 'color-picker', { value } );

		elementor.schemes.saveScheme( 'color-picker' );

		this.fixTipsyForFF( this.$addButton );
	}

	onEditButtonClick() {
		this.editMode = ! this.editMode;

		this.$editButton.text( elementor.translate( this.editMode ? 'done' : 'edit' ) );

		jQuery( this.picker.getRoot().app ).toggleClass( this.getSettings( 'classes.editMode' ), this.editMode );
	}

	onSwatchDragStart( event ) {
		if ( ! this.editMode ) {
			event.preventDefault();

			return false;
		}

		this.$draggedSwatch = jQuery( event.target );

		setTimeout( () => this.$draggedSwatch.addClass( 'elementor-hidden' ), 0 );
	}

	onSwatchDragEnd( event ) {
		jQuery( event.target ).removeClass( 'elementor-hidden' );
	}

	onDroppingAreaDropping() {
		const draggedSwatchIndex = this.$draggedSwatch.index();

		elementor.schemes.removeSchemeItem( 'color-picker', draggedSwatchIndex );

		elementor.schemes.saveScheme( 'color-picker' );

		this.picker.removeSwatch( draggedSwatchIndex );
	}
}
