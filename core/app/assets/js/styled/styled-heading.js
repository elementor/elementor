/*
import { forwardRef } from 'react';
import styled from 'styled-components';
import { getVariant } from 're-styled/utils';
import style from 'e-styles/heading';
 */

import Styled from 're-styled';
import styles from 'e-styles/heading';

console.log( 'Styled', Styled );

export const StyledHeading = ( props ) => (
	<Styled { ...props } component="heading" styles={ styles }>Rotem</Styled>
);

/*
const Heading = styled.h1`
	${ ( props ) => getVariant( props, style, props.variant ) }
	${ ( props ) => css` color: ${ props.theme.headingColor } ` }

	${ ( { variant, theme } ) => getStyle( style, { variant, theme } ) }
`;

const Heading = createStyled( { tag: 'h1', style: 'heading', props } );

export const StyledHeading = forwardRef( ( props, ref ) => (
	<Heading { ...props } as={ props.tag } ref={ ref }>{ props.children }</Heading>
) );

StyledHeading.displayName = 'StyledHeading';

StyledHeading.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	tag: PropTypes.oneOf( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ),
};

StyledHeading.baseProps = {
	className: '',
};

 */
