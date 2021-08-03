import styled from 'styled-components';
import { getVariant } from 'elementor-app/styled/utils';
import { variants } from 'elementor-app/styled/heading/variants';

const Heading = styled.h1`
	${ ( props ) => getVariant( props.variant, variants ) }
`;

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

