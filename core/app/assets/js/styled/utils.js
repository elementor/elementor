import { css } from 'styled-components';
import Variants from 'elementor-styles/variants';
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
		const variantData = Variants[ variant ],
			variantName = variant.toLowerCase(),
			variantObj = variantData[ variantName ];

		if ( ! variantObj ) {
			return '';
		}

		// TODO: Detect by value, not by string
		const darkObj = variantData[ '{{ dark }}' ][ variantName ],
			ltrObj = variantData[ '{{ ltr }}' ][ variantName ],
			rtlObj = variantData[ '{{ rtl }}' ][ variantName ],
			isDarkMode = document.body.classList.contains( 'eps-theme-dark' ), // TODO: read from a proper source
			isRtlMode = 'rtl' === getComputedStyle(document.body).direction; // TODO: read from a proper source

		if ( ! propValue ) {
			// Move to external function and handle media queries inside variants
			const getBaseStyle = ( obj ) => {
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
			};
			let baseStyle = getBaseStyle( variantObj );

			if ( isDarkMode && darkObj ) {
				baseStyle += getBaseStyle( darkObj );
			}

			if ( ltrObj ) {
				baseStyle += getBaseStyle( ltrObj )
			}

			if ( rtlObj ) {
				baseStyle += getBaseStyle( rtlObj )
			}

			return baseStyle;
		}

		const variantStyle = variantObj?.[ propValue ],
			darkStyle = darkObj?.[ propValue ],
			ltrStyle = ltrObj?.[ propValue ],
			rtlStyle = rtlObj?.[ propValue ];

		// Move to external function and handle media queries inside variants
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

			if ( isDarkMode && darkStyle ) {
				cssString += getVariantStyle( darkStyle );
			}

			if ( ! isRtlMode && ltrStyle ) {
				cssString += getVariantStyle( ltrStyle );
			}

			if ( isRtlMode && rtlStyle ) {
				cssString += getVariantStyle( rtlStyle );
			}

			return css`${ cssString }`;
		}
	};
}

export default {
	...styleHelpers,
	utils: Utils,
};
