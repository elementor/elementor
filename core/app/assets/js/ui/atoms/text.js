export default function Text( props ) {
	const baseClassName = 'eps',
		classes = [
			props.className,
		],
		tagName = props.tag,
		variant = props.variant && 'md' !== props.variant ? '-' + props.variant : '';

	classes.push( baseClassName + '-text' + variant );

	return React.createElement( tagName, {
		className: classes.filter( ( classItem ) => classItem ).join( ' ' ),
	}, props.children );
}

Text.propTypes = {
	className: PropTypes.string,
	variant: PropTypes.string,
	tag: PropTypes.string,
	children: PropTypes.any.isRequired,
};

Text.defaultProps = {
	className: '',
	tag: 'p',
};
