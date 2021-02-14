import CommandBase from 'elementor-api/modules/command-base';
import Utils from 'elementor/core/app/assets/js/utils/utils';

export class ShowSwatches extends CommandBase {
	constructor( args ) {
		super( args );

		this.colors = {};
		this.pickerClass = 'elementor-element-color-picker';
		this.pickerSelector = '.' + this.pickerClass;
		this.container = null;
		this.tmpImages = [];
	}

	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		this.container = elementor.getContainer( args.id );

		if ( this.container.view.$el.find( this.pickerSelector ).length ) {
			return;
		}

		this.extractColorsFromSettings();

		// Hack to wait for the images to load before picking the colors from it
		// when extracting colors from a background image control.
		// TODO: Find a better solution.
		setTimeout( () => {
			this.extractColorsFromImages();
			this.initSwatch();
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

			const value = this.container.getSetting( control );

			if ( value && ! Object.values( this.colors ).includes( value ) ) {
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
		this.tmpImages.push( img );
	}

	extractColorsFromImages() {
		// Iterate over all images in the widget.
		const images = [
			...this.tmpImages,
			...this.container.view.$el[ 0 ].querySelectorAll( 'img' ),
		];

		images.forEach( ( img, i ) => {
			const colorThief = new ColorThief();
			const palette =	colorThief.getPalette( img );

			// add the palette to the colors array.
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

		this.tmpImages = [];
	}

	// Create the swatch.
	initSwatch() {
		const count = Object.entries( this.colors ).length;
		const $picker = jQuery( '<div></div>', {
			class: this.pickerClass,
			css: {
				'--count': count,
			},
			'data-count': count,
		} );

		Object.entries( this.colors ).map( ( [ control, value ] ) => {
			$picker.append( jQuery( `<div></div>`, {
				class: 'elementor-element-color-picker__swatch',
				title: `${ control }: ${ value }`,
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

		this.container.view.$el.append( $picker );
	}

	// Check if the palette reached its limit.
	reachedColorsLimit() {
		const COLORS_LIMIT = 5;

		return ( COLORS_LIMIT <= Object.keys( this.colors ).length );
	}
}
