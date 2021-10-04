import { forwardRef } from 'react';
import { Styled, withStyles } from 'e-components';
import styles from 'e-styles/text';

const Text = forwardRef( ( props, ref ) => (
	<Styled { ...props } styles={ styles } ref={ ref }>{ props.children }</Styled>
) );

Text.displayName = 'Text';

Text.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	variant: PropTypes.oneOf( [ 'xxs', 'xs', 'sm', 'md', 'lg', 'xl' ] ),
	tag: PropTypes.string,
};

Text.defaultProps = {
	className: '',
	tag: 'p',
};

export default withStyles( Text );
