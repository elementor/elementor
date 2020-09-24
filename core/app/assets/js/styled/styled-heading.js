import styled from 'styled-components';
import _$ from 'elementor-styles';

const Heading = styled.h1`
	font-size: 30px;
	border-${ _$.direction`start` }: 5px solid green;
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
