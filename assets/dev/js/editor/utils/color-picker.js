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
			},
		};
	}

	createPicker() {
		const settings = this.getSettings();

		settings.default = settings.default || null;

		this.picker = new Pickr( settings );

		if ( ! settings.default ) {
			// Set a default palette. It doesn't affect the selected value
			this.picker.setColor( '#000' );
		}

		this.picker
			.on( 'change', ( ...args ) => this.onPickerChange( ...args ) )
			.on( 'clear', ( ...args ) => this.onPickerClear( ...args ) )
			.on( 'show', () => this.onPickerShow() );

		this.addPlusButton();

		this.addEditButton();

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
		const $swatch = jQuery( this.picker.addSwatch( color ) ),
			$removeSwatch = jQuery( '<i>', { class: 'eicon-close-circle' } );

		$removeSwatch.on( 'click', ( event ) => this.onRemoveSwatchClick( event ) );

		$swatch.html( $removeSwatch );
	}

	addSwatches() {
		this.getSwatches().children( '.pcr-swatch' ).remove();

		this.getColorPickerPalette().forEach( ( swatch ) => this.addSwatch( swatch ) );

		this.addToolsToSwatches();

		this.picker.activateSwatch();
	}

	addPlusButton() {
		this.$addButton = jQuery( '<button>', { class: 'elementor-color-picker__swatch-tool elementor-color-picker__add-swatch' } ).html( jQuery( '<i>', { class: 'eicon-plus' } ) );

		this.$addButton.on( 'click', () => this.onAddButtonClick() );

		this.$addButton.tipsy( {
			title: () => elementor.translate( 'add_picked_color' ),
			gravity: () => 's',
		} );
	}

	addEditButton() {
		this.$editButton = jQuery( '<button>', { class: 'elementor-color-picker__swatch-tool elementor-color-picker__edit-swatches' } ).html( jQuery( '<i>', { class: 'eicon-edit' } ) );

		this.$editButton.on( 'click', () => this.onEditButtonClick() );

		this.$editButton.tipsy( {
			title: () => elementor.translate( 'edit_colors' ),
			gravity: () => 's',
		} );
	}

	addToolsToSwatches() {
		this.getSwatches().append( this.$addButton, this.$editButton );
	}

	destroy() {
		this.picker.destroyAndRemove();
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

		// There's a bug in FireFox about hiding the tooltip after the `$addButton` was clicked,
		// So let's force it to hide
		const tipsyInstance = this.$addButton.data( 'tipsy' );

		tipsyInstance.hide();
	}

	onEditButtonClick() {
		this.editMode = ! this.editMode;

		this.getSwatches().toggleClass( 'elementor-color-picker-swatches--edit-mode', this.editMode );

		// There's a bug in FireFox about hiding the tooltip after the `$addButton` was clicked,
		// So let's force it to hide
		const tipsyInstance = this.$editButton.data( 'tipsy' );

		tipsyInstance.hide();
	}

	onRemoveSwatchClick( event ) {
		event.stopPropagation();

		const swatchIndex = jQuery( event.target ).index();

		elementor.schemes.removeSchemeItem( 'color-picker', swatchIndex );

		elementor.schemes.saveScheme( 'color-picker' );

		this.picker.removeSwatch( swatchIndex );
	}
}
