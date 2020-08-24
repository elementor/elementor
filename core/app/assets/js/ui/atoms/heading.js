export default function Heading( props ) {
	const baseClassName = 'eps',
		allowedTags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
		classes = [
			props.className,
		],
		tagName = allowedTags.includes( props.tag ) ? props.tag : 'h1';

	if ( props.variant ) {
		classes.push( baseClassName + '-' + props.variant );
	}

	return React.createElement( tagName, {
		className: classes.filter( ( classItem ) => classItem ).join( ' ' ),
	}, props.children );
}

Heading.propTypes = {
	className: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
	tag: PropTypes.string,
	variant: PropTypes.string.isRequired,
};

Heading.defaultProps = {
	className: '',
};
