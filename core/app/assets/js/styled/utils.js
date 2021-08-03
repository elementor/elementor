import { css } from 'styled-components';
import Variants from 'elementor-styles/variants';
import styleHelpers from 'elementor-styles';

const bindProp = ( obj ) => {
	const [ key, value ] = Object.entries( obj )[ 0 ];

	return value && css`
			${ key }: ${ value };
		`;
};

export const bindProps = ( data ) => {
	if ( ! Array.isArray( data ) ) {
		data = [ data ];
	}

	return data.map( ( obj ) => bindProp( obj ) );
};

export const getVariant = ( variant, propValue ) => {
	const variantData = Variants[ variant ],
		variantName = variant.toLowerCase(),
		variantObj = variantData[ variantName ];

	if ( ! variantObj ) {
		return '';
	}

	const darkObj = variantData[ styleHelpers.selectors.dark ][ variantName ],
		ltrObj = variantData[ styleHelpers.selectors.ltr ][ variantName ],
		rtlObj = variantData[ styleHelpers.selectors.rtl ][ variantName ],
		isDarkMode = document.body.classList.contains( 'eps-theme-dark' ), // TODO: read from a proper source
		isRtlMode = 'rtl' === getComputedStyle( document.body ).direction; // TODO: read from a proper source

	if ( ! propValue ) {
		let defaultStyle = '';

		defaultStyle += variantObj.default;

		if ( isDarkMode && darkObj ) {
			defaultStyle += darkObj.default;
		}

		if ( isRtlMode && rtlObj ) {
			defaultStyle += rtlObj.default;
		} else if ( ltrObj ) {
			defaultStyle += ltrObj.default;
		}

		return defaultStyle;
	}

	const variantStyle = variantObj?.[ propValue ],
		darkStyle = darkObj?.[ propValue ],
		ltrStyle = ltrObj?.[ propValue ],
		rtlStyle = rtlObj?.[ propValue ];

	if ( variantStyle ) {
		let cssString = variantStyle;

		if ( isDarkMode && darkStyle ) {
			cssString += darkStyle;
		}

		if ( isRtlMode && rtlStyle ) {
			cssString += rtlStyle;
		} else if ( ltrStyle ) {
			cssString += ltrStyle;
		}

		return css`${ cssString }`;
	}
};

class Utils {
	static bindProp = ( obj ) => {
		console.log( 'obj', obj );
		const [ key, value ] = Object.entries( obj )[ 0 ];

		return value && css`
			${ key }: ${ value };
		`;
	};

	static bindProps = ( arr ) => arr.map( ( obj ) => this.bindProp( obj ) );

	static getVariant = ( variant, propValue ) => {
		const variantData = Variants[ variant ],
			variantName = variant.toLowerCase(),
			variantObj = variantData[ variantName ];

		if ( ! variantObj ) {
			return '';
		}

		const darkObj = variantData[ styleHelpers.selectors.dark ][ variantName ],
			ltrObj = variantData[ styleHelpers.selectors.ltr ][ variantName ],
			rtlObj = variantData[ styleHelpers.selectors.rtl ][ variantName ],
			isDarkMode = document.body.classList.contains( 'eps-theme-dark' ), // TODO: read from a proper source
			isRtlMode = 'rtl' === getComputedStyle( document.body ).direction; // TODO: read from a proper source

		if ( ! propValue ) {
			let defaultStyle = '';

			defaultStyle += variantObj.default;

			if ( isDarkMode && darkObj ) {
				defaultStyle += darkObj.default;
			}

			if ( isRtlMode && rtlObj ) {
				defaultStyle += rtlObj.default;
			} else if ( ltrObj ) {
				defaultStyle += ltrObj.default;
			}

			return defaultStyle;
		}

		const variantStyle = variantObj?.[ propValue ],
			darkStyle = darkObj?.[ propValue ],
			ltrStyle = ltrObj?.[ propValue ],
			rtlStyle = rtlObj?.[ propValue ];

		if ( variantStyle ) {
			let cssString = variantStyle;

			if ( isDarkMode && darkStyle ) {
				cssString += darkStyle;
			}

			if ( isRtlMode && rtlStyle ) {
				cssString += rtlStyle;
			} else if ( ltrStyle ) {
				cssString += ltrStyle;
			}

			return css`${ cssString }`;
		}
	};
}

export default {
	...styleHelpers,
	utils: Utils,
};
