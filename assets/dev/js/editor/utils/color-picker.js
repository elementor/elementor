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
					},
				},
			},
			classes: {
				active: 'elementor-active',
				pickerHeader: 'elementor-color-picker__header',
				pickerToolsContainer: 'elementor-color-picker__tools',
				pickerTool: 'e-control-tool',
				customClearButton: 'elementor-color-picker__clear',
				swatchPlaceholder: 'elementor-color-picker__swatch-placeholder',
				addSwatch: 'elementor-color-picker__add-swatch',
				plusIcon: 'eicon-plus',
				trashIcon: 'eicon-trash-o',
			},
			selectors: {
				swatch: '.pcr-swatch',
			},
		};
	}

	createPicker() {
		const pickerSettings = this.getSettings( 'picker' );

		pickerSettings.default = pickerSettings.default || null;

		this.picker = new Pickr( pickerSettings );

		// Set a default palette. It doesn't affect the selected value
		this.picker.setColor( pickerSettings.default || '#020101' );

		this.color = this.processColor();

		this.picker
			.on( 'change', () => this.onPickerChange() )
			.on( 'clear', () => this.onPickerClear() )
			.on( 'show', () => this.onPickerShow() );

		this.$pickerAppContainer = jQuery( this.picker.getRoot().app );

		this.addPickerHeader();
	}

	addTipsyToClearButton() {
		this.$customClearButton.tipsy( {
			title: () => elementor.translate( 'clear' ),
			gravity: () => 's',
		} );
	}

	processColor() {
		const color = this.picker.getColor();

		let colorRepresentation;

		if ( 1 === color.a ) {
			colorRepresentation = color.toHEXA();
		} else {
			colorRepresentation = color.toRGBA();
		}

		return colorRepresentation.toString();
	}

	getColor() {
		return this.color;
	}

	getColorName( color ) {
		//  Check if the display value is HEX or HEXA (HEXA = with transparency)
		const colorForNaming = 7 < color.length ? color.slice( 0, 7 ) : color;

		return ntc.name( colorForNaming )[ 1 ];
	}

	getColorData() {
		const color = this.picker.getColor(),
			colorValue = color.toHEXA().toString( 0 );

		return {
			title: this.getColorName( colorValue ),
			value: colorValue,
		};
	}

	addPickerHeader() {
		const { classes } = this.getSettings(),
			$pickerHeader = jQuery( '<div>', { class: classes.pickerHeader } )
				.html( '<span>Color Picker</span>' ),
			$pickerToolsContainer = jQuery( '<div>', { class: classes.pickerToolsContainer } ),
			isGlobal = this.getSettings( 'global' );

		this.$pickerToolsContainer = $pickerToolsContainer;

		// Don't create the add button in the Global Settings color pickers
		if ( isGlobal?.active ) {
			this.createAddButton();
		}

		this.moveClearButton();

		$pickerToolsContainer.append( this.$customClearButton, this.$addButton );

		$pickerHeader.append( $pickerToolsContainer );

		this.$pickerAppContainer.prepend( $pickerHeader );
	}

	createAddButton() {
		const { classes } = this.getSettings();

		this.$addButton = jQuery( '<button>', { class: classes.pickerTool + ' ' + classes.addSwatch } ).html( jQuery( '<i>', { class: classes.plusIcon } ) );

		this.toggleButtonListener( '$addButton', true );

		this.$addButton.tipsy( {
			title: () => elementor.translate( 'create_global_color' ),
			gravity: () => 's',
		} );
	}

	toggleButtonListener( button, on ) {
		let callback = {};

		switch ( button ) {
			case '$addButton':
				callback = () => this.onAddButtonClick();
				break;
			case '$customClearButton':
				callback = () => this.picker._clearColor();
				break;
		}

		if ( on ) {
			this[ button ].on( 'click', callback );
		} else {
			this[ button ].off( 'click', '**' );
		}
	}

	// Move the clear button from Pickr's default location into the Color Picker header
	moveClearButton() {
		const { classes } = this.getSettings();

		this.$customClearButton = jQuery( '<div>', { class: classes.customClearButton + ' ' + classes.pickerTool } )
			.html( '<i class="eicon-undo"></i>' );

		this.toggleButtonListener( '$customClearButton', true );

		this.addTipsyToClearButton();
	}

	destroy() {
		this.picker.destroyAndRemove();
	}

	fixTipsyForFF( $button ) {
		// There's a bug in FireFox about hiding the tooltip after the button was clicked,
		// So let's force it to hide
		$button.data( 'tipsy' ).hide();
	}

	introductionViewed() {
		return ColorPicker.droppingIntroductionViewed || elementor.config.user.introduction.colorPickerDropping;
	}

	toggleToolState( button, value ) {
		if ( value ) {
			// When the picker is changed it means a color has been selected
			this[ button ].removeClass( 'e-control-tool-disabled' );
			this.toggleButtonListener( button, true );
		} else {
			this[ button ].addClass( 'e-control-tool-disabled' );
			this.toggleButtonListener( button, false );
		}
	}

	onPickerChange() {
		this.picker.applyColor();

		const newColor = this.processColor();

		if ( newColor === this.color ) {
			return;
		}

		this.color = newColor;

		const onChange = this.getSettings( 'onChange' );

		if ( onChange ) {
			onChange();
		}
	}

	onPickerClear() {
		this.color = '';

		const onClear = this.getSettings( 'onClear' );

		if ( onClear ) {
			onClear();
		}
	}

	onPickerShow() {
		const { result: resultInput } = this.picker.getRoot().interaction;

		setTimeout( () => {
			resultInput.select();

			this.picker._recalc = true;
		}, 100 );
	}

	onAddButtonClick() {
		elementor.schemes.addSchemeItem( 'color-picker', { value: this.color } );

		elementor.schemes.saveScheme( 'color-picker' );

		const onPickerAddButtonClick = this.getSettings( 'onAddButtonClick' );

		if ( onPickerAddButtonClick ) {
			onPickerAddButtonClick();
		}

		this.fixTipsyForFF( this.$addButton );
	}
}
