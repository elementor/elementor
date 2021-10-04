import { useContext, forwardRef } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { getStyle } from 'e-components/utils';

const Styled = forwardRef( ( props, ref ) => {
	const themeContext = useContext( ThemeContext ),
		styledProps = { ...props },
		nonStyledProps = [ 'children', 'className', 'component', 'tag', 'styles', 'extendStyles', 'extend', 'style' ];

	// Removing props that are not related to the component styles object.
	nonStyledProps.forEach( ( prop ) => delete styledProps[ prop ] );

	const stylesData = { props: styledProps, config: themeContext.config },
		componentCss = getStyle( props.styles, stylesData ),
		stylesExtension = getStyle( props.extendStyles, stylesData ),
		StyledComponent = styled[ props.tag ]`${ componentCss }${ stylesExtension }`;

	return <StyledComponent { ...props } ref={ ref }>{ props.children }</StyledComponent>;
} );

Styled.displayName = 'Styled';

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

export default Styled;

export const withStyles = ( StyledComponent ) => {
	return forwardRef( ( props, ref ) => {
		const newProps = { ...props };

		if ( props.styles ) {
			// Preventing the collision of the outer component 'styles' prop and the inner component 'styles' prop.
			newProps.extendStyles = props.styles;
			delete newProps.styles;
		}

		return <StyledComponent { ...newProps } ref={ ref } />;
	} );
};
