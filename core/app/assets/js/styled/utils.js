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
		if ( ! propValue ) {
			return;
		}

		if ( Variants[ component ] && Variants[ component ][ propValue ] ) {
			const cssString = Object.entries( Variants[ component ][ propValue ] ).map( ( [key, value] ) => `${ key }: ${ value };` ).join( '' );

			return css`${ cssString }`;
		}
	};
}
