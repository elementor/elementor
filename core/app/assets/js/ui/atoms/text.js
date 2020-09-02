export default function Text( props ) {
	const baseClassName = 'eps',
		classes = [
			props.className,
		],
		variant = props.variant && 'md' !== props.variant ? '-' + props.variant : '';

	classes.push( baseClassName + '-text' + variant );

	const classesString = Utils.arrayToClassName( classes );

	if ( props.tag ) {
		return React.createElement( props.tag, {
			className: classesString,
		}, props.children );
	}

	return (
		<p className={ classesString }>
			{ props.children }
		</p>
	);
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
