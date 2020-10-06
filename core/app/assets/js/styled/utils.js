import { css } from 'styled-components';
import Variants from './variants';
import styleHelpers from 'elementor-styles';

class Utils {
	static bindProp = ( obj ) => {
		const [ key, value ] = Object.entries( obj )[ 0 ];

		return value && css`
			${ key }: ${ value };
		`;
	};

	static bindProps = ( arr ) => arr.map( ( obj ) => this.bindProp( obj ) );

	static bindVariant = ( variant, propValue ) => {
		const variantObj = Variants[ variant ],
			variantDarkObj = Variants[ variant + '.dark' ],
			isDarkMode = document.body.classList.contains( 'eps-theme-dark' );

		let baseStyle = '';

		function getBaseStyle( obj ) {
			for ( const key in obj ) {
				const cssValue = obj[ key ];

				if ( 'string' === typeof cssValue  ) {
					baseStyle += `${ key }: ${ cssValue };`;
				} else if ( key.indexOf( '@media' ) > -1 ) {
					baseStyle += key + ' {';
					getBaseStyle( cssValue );
					baseStyle += '}';
				}
			}

			return baseStyle;
		}

		if ( ! variantObj ) {
			return '';
		}

		if ( ! propValue ) {
			let baseStyle = getBaseStyle( variantObj );

			if ( isDarkMode && variantDarkObj ) {
				baseStyle += getBaseStyle( variantDarkObj );
			}

			return baseStyle;
		}

		const variantStyle = variantObj?.[ propValue ],
			variantDarkStyle = variantDarkObj?.[ propValue ];

		function getVariantStyle( obj ) {
			return Object.entries( obj ).map( ( [ key, value ] ) => {
				if ( key.indexOf( '@media' ) > -1 ) {
					const mediaQueryObj = value;
					let mediaQueryCSS = key + ' {';

					for ( const mediaKey in mediaQueryObj ) {
						mediaQueryCSS += `${ mediaKey }: ${ mediaQueryObj[ mediaKey ] };`;
					}

					return mediaQueryCSS += '}';
				}

				return `${ key }: ${ value };`
			} ).join( '' );
		}

		if ( variantStyle ) {
			let cssString = getVariantStyle( variantStyle );

			if ( isDarkMode && variantDarkStyle ) {
				cssString += getVariantStyle( variantDarkStyle );
			}

			return css`${ cssString }`;
		}
	};
}

export default {
	...styleHelpers,
	utils: Utils,
};
