import { css } from 'styled-components';
import Variants from 'elementor-styles/variants';

export default class Utils {
	static bindProp = ( obj ) => {
		const [ key, value ] = Object.entries( obj )[ 0 ];

		return value && css`
			${ key }: ${ value };
		`;
	};

	static bindProps = ( arr ) => arr.map( ( obj ) => this.bindProp( obj ) );

	static bindVariant = ( component, propValue ) => {
		const componentData = Variants[ component ];

		if ( ! componentData ) {
			return '';
		}

		if ( ! propValue ) {
			let baseStyle = '';

			for ( const key in componentData ) {
				const cssValue = componentData[ key ];

				if ( 'string' === typeof cssValue ) {
					baseStyle += `${ key }: ${ cssValue };`;
				}
			}

			return baseStyle;
		}

		const variantData = componentData?.[ propValue ];

		if ( variantData ) {
			const cssString = Object.entries( variantData ).map( ( [key, value] ) => `${ key }: ${ value };` ).join( '' );

			return css`${ cssString }`;
		}
	};
}
