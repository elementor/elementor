export default class ColorPicker extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.createPicker();
	}

	getColorPickerPaletteIndex( paletteKey ) {
		return [ '7', '8', '1', '5', '2', '3', '6', '4' ].indexOf( paletteKey );
	}

	getColorPickerPalette() {
		const colorPickerScheme = elementor.schemes.getScheme( 'color-picker' ),
			items = _.sortBy( colorPickerScheme.items, ( item ) => {
				return this.getColorPickerPaletteIndex( item.key );
			} );

		return _.pluck( items, 'value' );
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

		const picker = Pickr.create( settings ),
			onChange = ( ...args ) => {
				picker.applyColor();

				if ( settings.onChange ) {
					settings.onChange( ...args );
				}
			},
			onClear = ( ...args ) => {
				if ( settings.onClear ) {
					settings.onClear( ...args );
				}
			};

		picker
			.on( 'change', onChange )
			.on( 'swatchselect', onChange )
			.on( 'clear', onClear );

		this.picker = picker;

		this.draggableSwatches( this.getSwatches().children() );

		this.addPlusButton();

		this.addSwatchDroppingArea();
	}

	getValue() {
		return this.picker.getColor().toRGBA().toString( 0 );
	}

	getSwatches() {
		return jQuery( this.picker.getRoot().swatches );
	}

	addPlusButton() {
		this.$addButton = jQuery( '<button>', { class: 'elementor-color-picker--add-swatch' } ).html( jQuery( '<i>', { class: 'eicon-plus' } ) );

		this.$addButton.on( 'click', () => this.onAddButtonClick() );

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
	}

	onAddButtonClick() {
		const value = this.getValue();

		this.picker.addSwatch( value );

		this.draggableSwatches( this.getSwatches().children().last() );

		this.addPlusButtonToSwatches();

		elementor.schemes.addSchemeItem( 'color-picker', { value } );

		elementor.schemes.saveScheme( 'color-picker' );
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

		this.$draggedSwatch.remove();
	}
}
