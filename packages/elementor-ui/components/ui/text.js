import styled from 'styled-components';
import { getStyle } from 'e-utils';
import styles from 'e-styles/text';

const TextBase = styled.p.attrs( ( props ) => ( { as: props.tag } ) )`${ ( props ) => getStyle( styles, props, 'shared' ) }`;

const Text = styled( TextBase )`${ ( props ) => getStyle( styles, props, 'unique' ) }`;

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
