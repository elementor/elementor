import { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { getStyle, mergeStyles } from 're-styled/utils';

export default function Styled( props ) {
	console.log( 'props', props );
	const themeContext = useContext( ThemeContext ),
		styledProps = { ...props };

	const styles = mergeStyles( props.styles, props.extendStyles );

	// Removing props that are not related to the component styles object.
	[ 'children', 'className', 'component', 'tag', 'styles' ].forEach( ( prop ) => delete styledProps[ prop ] );

	const componentCss = getStyle( styles, { theme: themeContext.config, props: styledProps } ),
		StyledComponent = styled[ props.tag ]`${ componentCss }`;

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
