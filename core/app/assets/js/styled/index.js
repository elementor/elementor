import { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { getStyle } from 're-styled/utils';

export default function Styled( props ) {
	const themeContext = useContext( ThemeContext ),
		{ component } = props,
		styledProps = { ...props };

	// Removing props that are not related to the component styles object.
	[ 'children', 'className', 'component', 'tag', 'styles' ].forEach( ( prop ) => delete styledProps[ prop ] );

	const componentCss = getStyle( props.styles, { theme: themeContext.config, props: styledProps } ),
		StyledComponent = styled[ props.tag ]`${ componentCss }`;

	return <StyledComponent { ...props }>{ props.children }</StyledComponent>;
}

Styled.propTypes = {
	component: PropTypes.string.isRequired,
	tag: PropTypes.string.isRequired,
	className: PropTypes.string,
	children: PropTypes.any,
	styles: PropTypes.object,
};

Styled.defaultProps = {
	className: '',
	styles: {},
};
