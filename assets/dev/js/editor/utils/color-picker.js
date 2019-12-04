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
				swatchTool: 'elementor-color-picker__swatch-tool',
				addSwatch: 'elementor-color-picker__add-swatch',
				removeSwatch: 'elementor-color-picker__remove-swatch',
				plusIcon: 'eicon-plus',
				trashIcon: 'eicon-trash-o',
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

		this.addPlusButton();

		this.addRemoveButton();

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
		this.picker.addSwatch( color );
	}

	addSwatches() {
		this.getSwatches().children( this.getSettings( 'selectors.swatch' ) ).remove();

		this.getColorPickerPalette().forEach( ( swatch ) => this.addSwatch( swatch ) );

		this.addToolsToSwatches();
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

	addRemoveButton() {
		const { classes } = this.getSettings();

		this.$removeButton = jQuery( '<button>', { class: classes.swatchTool + ' ' + classes.removeSwatch } ).html( jQuery( '<i>', { class: classes.trashIcon } ) );

		this.$removeButton.on( 'click', () => this.onRemoveButtonClick() );

		this.$removeButton.tipsy( {
			title: () => elementor.translate( 'remove_color' ),
			gravity: () => 's',
		} );
	}

	addToolsToSwatches() {
		this.getSwatches().append( this.$addButton, this.$removeButton );

		this.picker.activateSwatch();
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

	onRemoveButtonClick() {
		const swatchIndex = jQuery( this.getSwatches().children( this.getSettings( 'selectors.activeSwatch' ) ) ).index();

		elementor.schemes.removeSchemeItem( 'color-picker', swatchIndex );

		elementor.schemes.saveScheme( 'color-picker' );

		this.picker.removeSwatch( swatchIndex );

		this.fixTipsyForFF( this.$removeButton );
	}
}
