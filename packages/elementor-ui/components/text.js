import { forwardRef } from 'react';
import Styled, { withStyles } from 're-styled';
import styles from 'e-styles/text';

const Text = forwardRef( ( props, ref ) => (
	<Styled { ...props } tag="p" styles={ styles } ref={ ref }>{ props.children }</Styled>
) );

Text.displayName = 'Text';

Text.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	tag: PropTypes.oneOf( [ 'xxs', 'xs', 'sm', 'md', 'lg', 'xl' ] ),
};

Text.defaultProps = {
	className: '',
};

export default withStyles( Text );
