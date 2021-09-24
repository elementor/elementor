import { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { getStyle } from 're-styled/utils';

export default function Styled( props ) {
	const themeContext = useContext( ThemeContext ),
		styledProps = { ...props },
		nonStyledProps = [ 'children', 'className', 'component', 'tag', 'styles', 'extendStyles', 'extend' ];

	// Removing props that are not related to the component styles object.
	nonStyledProps.forEach( ( prop ) => delete styledProps[ prop ] );

	const stylesData = { props: styledProps, config: themeContext.config },
		componentCss = getStyle( props.styles, stylesData ),
		stylesExtension = getStyle( props.extendStyles, stylesData ),
		StyledComponent = styled[ props.tag ]`${ componentCss }${ stylesExtension }`;

	return <StyledComponent { ...props }>{ props.children }</StyledComponent>;
}

Styled.propTypes = {
	tag: PropTypes.string.isRequired,
	className: PropTypes.string,
	children: PropTypes.any,
	styles: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
	extendStyles: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
};

Styled.defaultProps = {
	className: '',
	styles: '',
	extendStyles: '',
};

export const withStyles = ( StyledComponent ) => {
	return ( props ) => {
		const newProps = { ...props };

		if ( props.styles ) {
			// Preventing the collision of the outer component 'styles' prop and the inner component 'styles' prop.
			newProps.extendStyles = props.styles;
		}

		return <StyledComponent { ...newProps } />;
	};
};
