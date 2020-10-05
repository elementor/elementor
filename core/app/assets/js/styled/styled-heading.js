import styled from 'styled-components';
import _$ from 'elementor-styles';
import Utils from './utils.js';

const Heading = styled.h1`
	border-${ _$.direction`start` }: 5px solid aqua;

	${ Utils.bindVariant( 'Heading' ) }
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
