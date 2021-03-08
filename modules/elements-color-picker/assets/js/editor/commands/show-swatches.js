import CommandBase from 'elementor-api/modules/command-base';
import Utils from 'elementor/core/app/assets/js/utils/utils';

export class ShowSwatches extends CommandBase {
	constructor( args ) {
		super( args );

		this.colors = {};
		this.pickerClass = 'e-element-color-picker';
		this.pickerSelector = '.' + this.pickerClass;
		this.container = null;
		this.backgroundImages = [];
	}

	validateArgs( args ) {
		this.requireArgument( 'event', args );
	}

	apply( args ) {
		const { event: e } = args;
		const id = e.currentTarget.dataset.id;

		// Calculate swatch location.
		const rect = e.currentTarget.getBoundingClientRect();
		const x = Math.round( e.clientX - rect.left ) + 'px';
		const y = Math.round( e.clientY - rect.top ) + 'px';

		// Don't pick colors from the current widget.
		if ( id === this.component.currentPicker.container.id ) {
			return;
		}

		this.container = elementor.getContainer( id );

		const $activePicker = this.container.view.$el.find( this.pickerSelector );

		// If there is a picker already, just move it to the click area.
		if ( $activePicker.length ) {
			$activePicker.css( {
				'--left': x,
				'--top': y,
			} );

			return;
		}

		this.extractColorsFromSettings();

		// Hack to wait for the images to load before picking the colors from it
		// when extracting colors from a background image control.
		// TODO: Find a better solution.
		setTimeout( () => {
			this.extractColorsFromImages();
			this.initSwatch( x, y );
		}, 100 );
	}

	extractColorsFromSettings() {
		// Iterate over the widget controls.
		Object.keys( this.container.settings.attributes ).map( ( control ) => {
			// Limit colors count.
			if ( this.reachedColorsLimit() ) {
				return;
			}

			if ( ! ( control in this.container.controls ) ) {
				return;
			}

			// Handle background images.
			if ( control.startsWith( '_background_image' ) ) {
				this.addTempBackgroundImage( this.container.getSetting( control ) );
			}

			// Throw non-color controls.
			if ( 'color' !== this.container.controls[ control ]?.type ) {
				return;
			}

			// Throw non-active controls.
			if ( ! elementor.helpers.isActiveControl( this.container.controls[ control ], this.container.settings.attributes ) ) {
				return;
			}

			let value = this.container.getSetting( control );

			if ( value && ! Object.values( this.colors ).includes( value ) ) {
				// If it's a global color, it will return a css variable which needs to be resolved to a HEX value.
				const pattern = /var\(([^)]+)\)/i;
				const matches = value.match( pattern );

				if ( matches ) {
					value = getComputedStyle( this.container.view.$el[ 0 ] ).getPropertyValue( matches[ 1 ].trim() );
				}

				this.colors[ control ] = value;
			}
		} );
	}

	addTempBackgroundImage( { url } ) {
		if ( ! url ) {
			return;
		}

		// Create the image.
		const img = document.createElement( 'img' );
		img.src = url;

		// Push the image to the temporary images array.
		this.backgroundImages.push( img );
	}

	extractColorsFromImages() {
		// Iterate over all images in the widget.
		const images = [
			...this.container.view.$el[ 0 ].querySelectorAll( 'img' ),
			...this.backgroundImages,
		];

		images.forEach( ( img, i ) => {
			const colorThief = new ColorThief();
			const palette =	colorThief.getPalette( img );

			// Add the palette to the colors array.
			palette.forEach( ( color, index ) => {
				const hex = Utils.rgbToHex( color[ 0 ], color[ 1 ], color[ 2 ] );

				// Limit colors count.
				if ( this.reachedColorsLimit() ) {
					return;
				}

				if ( ! Object.values( this.colors ).includes( hex ) ) {
					this.colors[ `palette-${ i }-${ index }` ] = hex;
				}
			} );
		} );

		this.backgroundImages = [];
	}

	// Create the swatch.
	initSwatch( x = 0, y = 0 ) {
		const count = Object.entries( this.colors ).length;

		// Don't render the picker when there are no extracted colors.
		if ( 0 === count ) {
			return;
		}

		const $picker = jQuery( '<div></div>', {
			class: this.pickerClass,
			css: {
				'--count': count,
				'--left': x,
				'--top': y,
			},
			'data-count': count,
		} );

		// Append the swatch before adding colors to it in order to avoid the click event of the swatches,
		// which will fire the `apply` command and will close everything.
		this.container.view.$el.append( $picker );

		Object.entries( this.colors ).map( ( [ control, value ] ) => {
			$picker.append( jQuery( `<div></div>`, {
				class: `${ this.pickerClass }__swatch`,
				css: {
					'--color': value,
				},
				'data-color': value,
				on: {
					mouseenter: () => $e.run( 'elements-color-picker/enter-preview', { value } ),
					mouseleave: () => $e.run( 'elements-color-picker/exit-preview' ),
					click: ( event ) => {
						$e.run( 'elements-color-picker/apply', {
							value,
							trigger: {
								palette: $picker,
								swatch: event.target,
							},
						} );

						event.stopPropagation();
					},
				},
			} )	);
		} );
	}

	// Check if the palette reached its limit.
	reachedColorsLimit() {
		const COLORS_LIMIT = 5;

		return ( COLORS_LIMIT <= Object.keys( this.colors ).length );
	}
}
