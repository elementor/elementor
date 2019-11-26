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
			theme: 'monolith',
			swatches: this.getColorPickerPalette(),
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

		this.draggableSwatches( this.getSwatches().children() );

		this.addPlusButton();

		this.addSwatchDroppingArea();
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

	addPlusButton() {
		this.$addButton = jQuery( '<button>', { class: 'elementor-color-picker--add-swatch' } ).html( jQuery( '<i>', { class: 'eicon-plus' } ) );

		this.$addButton.on( 'click', () => this.onAddButtonClick() );

		this.$addButton.tipsy( {
			title: () => elementor.translate( 'add_picked_color' ),
			gravity: () => 's',
		} );

		this.addPlusButtonToSwatches();
	}

	addSwatchDroppingArea() {
		this.$droppingArea = jQuery( '<div>', { class: 'elementor-color-picker--dropping-area' } ).html( jQuery( '<i>', { class: 'eicon-trash-o' } ) );

		this.getSwatches().after( this.$droppingArea );

		this.$droppingArea.html5Droppable( {
			items: '',
			onDropping: this.onDroppingAreaDropping.bind( this ),
		} );
	}

	addPlusButtonToSwatches() {
		this.getSwatches().append( this.$addButton );
	}

	draggableSwatches( $swatches ) {
		$swatches.html5Draggable( {
			onDragStart: this.onSwatchDragStart.bind( this ),
			onDragEnd: this.onSwatchDragEnd.bind( this ),
		} );
	}

	destroy() {
		this.picker.destroyAndRemove();

		ColorPicker.swachesNeedUpdate = false;
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
		if ( ColorPicker.swachesNeedUpdate ) {
			this.getSwatches().children( '.pcr-swatch' ).remove();

			this.getColorPickerPalette().forEach( ( swatch ) => this.picker.addSwatch( swatch ) );

			this.addPlusButtonToSwatches();

			this.picker.activateSwatch();
		}

		const { result: resultInput } = this.picker.getRoot().interaction;

		setTimeout( () => {
			resultInput.select();

			this.picker._recalc = true;
		}, 100 );
	}

	onAddButtonClick() {
		const value = this.getValue();

		this.picker.addSwatch( value );

		this.draggableSwatches( this.getSwatches().children().last() );

		this.addPlusButtonToSwatches();

		elementor.schemes.addSchemeItem( 'color-picker', { value } );

		elementor.schemes.saveScheme( 'color-picker' );

		ColorPicker.swachesNeedUpdate = true;

		// There's a bug in FireFox about hiding the tooltip after the `$addButton` was clicked,
		// So let's force it to hide
		const tipsyInstance = this.$addButton.data( 'tipsy' );

		tipsyInstance.hide();
	}

	onSwatchDragStart( event ) {
		this.$droppingArea.slideDown();

		this.$draggedSwatch = jQuery( event.target );

		setTimeout( () => this.$draggedSwatch.addClass( 'elementor-hidden' ), 0 );
	}

	onSwatchDragEnd( event ) {
		this.$droppingArea.slideUp();

		jQuery( event.target ).removeClass( 'elementor-hidden' );
	}

	onDroppingAreaDropping() {
		this.$droppingArea.slideUp();

		const draggedSwatchIndex = this.$draggedSwatch.index();

		elementor.schemes.removeSchemeItem( 'color-picker', draggedSwatchIndex );

		elementor.schemes.saveScheme( 'color-picker' );

		this.picker.removeSwatch( draggedSwatchIndex );

		ColorPicker.swachesNeedUpdate = true;
	}
}

ColorPicker.swachesNeedUpdate = false;
