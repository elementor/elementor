import Styled, { withStyles } from './styled';
import { css, cx } from '@emotion/css';

export default function styled( element ) {
	return ( arr, ...styles ) => {
		return ( props ) => {
			const newProps = { ...props },
				finalStyles = [ arr[ 0 ], ...styles ].join( '' );

			newProps.className = [ newProps.className, css`${ finalStyles }` ].filter( ( value ) => value ).join( ' ' );

			if ( 'string' === typeof element ) {
				return React.createElement( element, newProps, props.children );
			}

			const Element = element;

			return React.cloneElement( <Element />, { ...newProps }, props.children );
		};
	};
}

export { Styled, withStyles };
export { default as StyledHeading } from './ui/heading';
export { default as StyledText } from './ui/text';
