import styled from 'styled-components';
import { getVariant } from 're-styled/utils';
import style from 'e-styles/heading';

const Heading = styled.h1`
	font-size: 21px;
	font-weight: bold;

	${ ( props ) => getVariant( props, style, props.variant ) }
`;

/*
	${ style.default.shared }
	${ ( props ) => style.default.variants[ props.variant ] }
	${ ( props ) => props.theme.variants.dark && style.dark.variants[ props.variant ] }
*/

export const StyledHeading = ( props ) => (
	<Heading { ...props } as={ props.tag }>{ props.children }</Heading>
);

StyledHeading.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	tag: PropTypes.oneOf( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ),
};

StyledHeading.defaultProps = {
	className: '',
};
