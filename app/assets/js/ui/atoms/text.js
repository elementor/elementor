import { arrayToClassName } from '../../utils/utils';

export default function Text( props ) {
	const baseClassName = 'eps',
		classes = [
			props.className,
		],
		variant = props.variant && 'md' !== props.variant ? '-' + props.variant : '';

	classes.push( baseClassName + '-text' + variant );

	const Element = () => React.createElement( props.tag, {
		className: arrayToClassName( classes ),
	}, props.children );

	return <Element />;
}

Text.propTypes = {
	className: PropTypes.string,
	variant: PropTypes.oneOf( [ 'xl', 'lg', 'md', 'sm', 'xs', 'xxs' ] ),
	tag: PropTypes.string,
	children: PropTypes.any.isRequired,
};

Text.defaultProps = {
	className: '',
	tag: 'p',
};
