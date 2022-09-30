import styled from 'styled-components';
import { getStyle } from 'e-utils';
import styles from 'e-styles/heading';

const SharedHeading = styled.h1.attrs( ( props ) => ( { as: props.tag } ) )`${ ( props ) => getStyle( styles, props, 'shared' ) }`;

const Heading = styled( SharedHeading )`${ ( props ) => getStyle( styles, props, 'unique' ) }`;

Heading.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	tag: PropTypes.oneOf( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ),
	variant: PropTypes.oneOf( [ 'display-1', 'display-2', 'display-3', 'display-4', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ).isRequired,
};

Heading.defaultProps = {
	className: '',
	tag: 'h1',
};

export default Heading;
