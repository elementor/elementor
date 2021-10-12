import styled from 'styled-components';
import { getStyle } from 'e-components/utils';
import styles from 'e-styles/text';

const Text = styled.p`${ ( props ) => getStyle( styles, props ) }`;

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

export default Text;
