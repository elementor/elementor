import { forwardRef } from 'react';
import { withStyles } from 'e-components';
import StyledUI from '../styled-ui';
import styles from 'e-styles/heading';

const Heading = forwardRef( ( props, ref ) => (
	<StyledUI { ...props } styles={ styles } ref={ ref } cacheKey="heading">{ props.children }</StyledUI>
) );

Heading.displayName = 'Heading';

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

export default withStyles( Heading );
