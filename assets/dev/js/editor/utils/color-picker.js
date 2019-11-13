export default class ColorPicker extends elementorModules.Module {
	static getColorPickerPaletteIndex( paletteKey ) {
		return [ '7', '8', '1', '5', '2', '3', '6', '4' ].indexOf( paletteKey );
	}

	constructor( ...args ) {
		super( ...args );

		this.picker = this.createPicker();
	}

	getColorPickerPalette() {
		const colorPickerScheme = elementor.schemes.getScheme( 'color-picker' ),
			items = _.sortBy( colorPickerScheme.items, ( item ) => {
				return ColorPicker.getColorPickerPaletteIndex( item.key );
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

		return picker;
	}

	getValue() {
		return this.picker.getColor().toRGBA().toString( 0 );
	}

	destroy() {
		this.picker.destroyAndRemove();
	}
}
