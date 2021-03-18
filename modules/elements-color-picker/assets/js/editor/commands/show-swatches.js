import CommandBase from 'elementor-api/modules/command-base';
import { rgbToHex } from 'elementor/core/app/assets/js/utils/utils';

export class ShowSwatches extends CommandBase {
	constructor( args ) {
		super( args );

		this.colors = {};
		this.pickerClass = 'e-element-color-picker';
		this.pickerSelector = '.' + this.pickerClass;
		this.container = null;
		this.backgroundImages = [];
	}

	/**
	 * Validate the command arguments.
	 *
	 * @param args
	 */
	validateArgs( args ) {
		this.requireArgument( 'event', args );
	}

	/**
	 * Execute the command.
	 *
	 * @param args
	 */
	apply( args ) {
		const { event: e } = args;
		const id = e.currentTarget.dataset.id;

		e.stopPropagation();

		// Calculate swatch location.
		const rect = e.currentTarget.getBoundingClientRect(),
			x = Math.round( e.clientX - rect.left ) + 'px',
			y = Math.round( e.clientY - rect.top ) + 'px';

		// Don't pick colors from the current widget.
		if ( id === this.component.currentPicker.container.id ) {
			return;
		}

		this.container = elementor.getContainer( id );

		const $activePicker = elementor.$previewContents.find( this.pickerSelector );

		// If there is a picker already, remove it.
		if ( $activePicker.length ) {
			$activePicker.remove();
		}

		// Hack to wait for the images to load before picking the colors from it
		// when extracting colors from a background image control.
		// TODO: Find a better solution.
		setTimeout( () => {
			const isImage = ( 'img' === e.target.tagName.toLowerCase() );

			if ( isImage ) {
				this.extractColorsFromImage( e.target );
			} else {
				this.extractColorsFromSettings();
				this.extractColorsFromImages();
			}

			this.initSwatch( x, y );
		}, 50 );
	}

	/**
	 * Extract colors from color controls of the current selected element.
	 */
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

			// Determine if the current control is active.
			const isActive = () => {
				return ( elementor.helpers.isActiveControl( this.container.controls[ control ], this.container.settings.attributes ) );
			};

			// Handle background images.
			if ( control.includes( 'background_image' ) && isActive() ) {
				this.addTempBackgroundImage( this.container.getSetting( control ) );
				return;
			}

			// Throw non-color controls.
			if ( 'color' !== this.container.controls[ control ]?.type ) {
				return;
			}

			// Throw non-active controls.
			if ( ! isActive() ) {
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

	/**
	 * Create a temporary image element in order to extract colors from it using ColorThief.
	 * Used with background images from background controls.
	 *
	 * @param url
	 */
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

	/**
	 * Extract colors from image and push it ot the colors array.
	 *
	 * @param {Object} image    The image element to extract colors from
	 * @param {String} suffix   An optional suffix for the key in the colors array.
	 */
	extractColorsFromImage( image, suffix = '' ) {
		const colorThief = new ColorThief();
		let palette;

		try {
			palette = colorThief.getPalette( image );
		} catch ( e ) {
			return;
		}

		// Add the palette to the colors array.
		palette.forEach( ( color, index ) => {
			const hex = rgbToHex( color[ 0 ], color[ 1 ], color[ 2 ] );

			// Limit colors count.
			if ( this.reachedColorsLimit() ) {
				return;
			}

			if ( ! Object.values( this.colors ).includes( hex ) ) {
				this.colors[ `palette-${ suffix }-${ index }` ] = hex;
			}
		} );
	}

	/**
	 * Iterate over all images in the current selected element and extract colors from them.
	 */
	extractColorsFromImages() {
		// Iterate over all images in the widget.
		const images = this.backgroundImages;

		images.forEach( ( img, i ) => {
			this.extractColorsFromImage( img, i );
		} );

		this.backgroundImages = [];
	}

	/**
	 * Initialize the swatch with the color palette, using x & y positions, relative to the parent.
	 *
	 * @param x
	 * @param y
	 */
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

		// Remove the picker on mouse leave.
		this.container.view.$el.on( 'mouseleave.color-picker', () => {
			jQuery( this ).off( 'mouseleave.color-picker' );

			// Remove only after the animation has finished.
			setTimeout( () => {
				$picker.remove();
			}, 300 );
		} );
	}

	/**
	 * Check if the palette reached its colors limit.
	 *
	 * @returns {boolean}
	 */
	reachedColorsLimit() {
		const COLORS_LIMIT = 5;

		return ( COLORS_LIMIT <= Object.keys( this.colors ).length );
	}
}
