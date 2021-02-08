import CommandBase from 'elementor-api/modules/command-base';
import ColorThief from '../../lib/color-thief-2.3.2';

export class ShowSwatches extends CommandBase {
	apply( args ) {
		if ( ! args.id ) {
			return;
		}

		const container = elementor.getContainer( args.id ),
			colors = {},
			pickerClass = 'elementor-element-color-picker',
			pickerSelector = '.' + pickerClass;

		if ( container.view.$el.find( pickerSelector ).length ) {
			return;
		}

		Object.keys( container.settings.attributes ).map( ( control ) => {
			// Temp fix for control without conditions
			if ( '_background_hover_color_b' === control || '_background_color_b' === control ) {
				return;
			}

			if ( 'color' === container.controls[ control ]?.type ) {
				const value = container.getSetting( control );
				if ( value && ! Object.values( colors ).includes( value ) ) {
					colors[ control ] = value;
				}
			}
		} );

		if ( container.view.$el.find( 'img' ).length ) {

			const colorThief = new ColorThief();
			const palette =	colorThief.getPalette( container.view.$el.find( 'img' ).eq( 0 )[ 0 ] );

			const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
				const hex = x.toString(16)
				return hex.length === 1 ? '0' + hex : hex
			}).join('');

			palette.forEach( ( color, index ) => {
				colors[ 'palette' + index ] = rgbToHex( color[0], color[1], color[2] );
			} );
		}

		const $picker = jQuery( '<div></div>', {
			class: pickerClass,
		} );

		Object.entries( colors ).map( ( [ control, value ] ) => {
			$picker.append( jQuery( `<div></div>`, {
				class: 'elementor-element-color-picker__swatch',
				title: `${ control }: ${ value }`,
				css: {
					backgroundColor: value,
				},
				on: {
					mouseenter: () => $e.run( 'elements-color-picker/apply', { value } ),
					click: () => $e.run( 'elements-color-picker/end', { value } ),
				},
			} )	);
		} );

		container.view.$el.append( $picker );
	}
}
