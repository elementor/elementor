import styled from 'styled-components';
import { getStyle } from 'e-components/utils';
import styles from 'e-styles/heading';

const Heading = styled.h1`${ ( props ) => getStyle( styles, props ) }`;

Heading.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	tag: PropTypes.oneOf( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ),
	variant: PropTypes.oneOf( [ 'display-1', 'display-2', 'display-3', 'display-4', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ).isRequired,
};

Heading.defaultProps = {
	className: '',
	tag: 'h1',
	variant: 'h1',
};

export default Heading;
