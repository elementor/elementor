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
				active: 'elementor-active',
				header: 'elementor-color-picker__header',
				savedColorsTitle: 'elementor-color-picker__saved-colors-title',
				editButton: 'elementor-color-picker__saved-colors-edit',
				swatchTool: 'elementor-color-picker__swatch-tool',
				swatchPlaceholder: 'elementor-color-picker__swatch-placeholder',
				addSwatch: 'elementor-color-picker__add-swatch',
				droppingArea: 'elementor-color-picker__dropping-area',
				plusIcon: 'eicon-plus',
				trashIcon: 'eicon-trash-o',
				isEditMode: 'elementor-color-picker--edit-mode',
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
		jQuery( this.picker.addSwatch( color ) );
	}

	addSwatches() {
		const settings = this.getSettings();

		this.getSwatches().children( settings.selectors.swatch ).remove();

		this.picker._swatchColors = [];

		this.getColorPickerPalette().forEach( ( swatch ) => this.addSwatch( swatch ) );

		this.getSwatches().sortable( {
			items: '.pcr-swatch',
			placeholder: settings.classes.swatchPlaceholder,
			connectWith: this.$droppingArea,
			disabled: true,
			start: ( ...args ) => this.onSwatchesSortStart( ...args ),
			update: ( ...args ) => this.onSwatchesSortUpdate( ...args ),
		} );

		this.addToolsToSwatches();
	}

	addHeader() {
		const { classes } = this.getSettings(),
			$header = jQuery( '<div>', { class: classes.header } ),
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

		this.$droppingArea.sortable( {
			cancel: '.eicon-trash-o',
			placeholder: classes.swatchPlaceholder,
			over: () => this.onDroppingAreaOver(),
			out: () => this.onDroppingAreaOut(),
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
		this.isEditMode = ! this.isEditMode;

		this.$editButton.text( elementor.translate( this.isEditMode ? 'done' : 'edit' ) );

		jQuery( this.picker.getRoot().app ).toggleClass( this.getSettings( 'classes.isEditMode' ), this.isEditMode );

		this.getSwatches().sortable( this.isEditMode ? 'enable' : 'disable' );
	}

	onDroppingAreaOver() {
		this.$droppingArea.addClass( this.getSettings( 'classes.active' ) );
	}

	onDroppingAreaOut() {
		this.$droppingArea.removeClass( this.getSettings( 'classes.active' ) );
	}

	onSwatchesSortStart( event ) {
		this.sortedSwatchIndex = jQuery( event.srcElement ).index();
	}

	onSwatchesSortUpdate( event ) {
		const sortedScheme = elementor.schemes.getSchemeValue( 'color-picker', this.sortedSwatchIndex + 1 );

		elementor.schemes.removeSchemeItem( 'color-picker', this.sortedSwatchIndex );

		const $sortedSwatch = jQuery( event.srcElement );

		if ( $sortedSwatch.parent().is( this.$droppingArea ) ) {
			this.picker._swatchColors.splice( this.sortedSwatchIndex, 1 );

			$sortedSwatch.remove();
		} else {
			elementor.schemes.addSchemeItem( 'color-picker', sortedScheme, $sortedSwatch.index() );
		}

		elementor.schemes.saveScheme( 'color-picker' );
	}
}
