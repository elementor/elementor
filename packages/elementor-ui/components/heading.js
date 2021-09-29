import { forwardRef } from 'react';
import { Styled, withStyles } from 'e-components';
import styles from 'e-styles/heading';

const Heading = forwardRef( ( props, ref ) => (
	<Styled { ...props } tag="h1" styles={ styles } ref={ ref }>{ props.children }</Styled>
) );

Heading.displayName = 'Heading';

Heading.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	tag: PropTypes.oneOf( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ),
};

Heading.baseProps = {
	className: '',
};

export default withStyles( Heading );
