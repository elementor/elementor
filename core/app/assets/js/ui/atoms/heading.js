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

	const classesString = Utils.arrayToClassName( classes );

	if ( props.tag ) {
		return React.createElement( tagName, {
			className: classesString,
		}, props.children );
	}

	return (
		<h1 className={ classesString }>
			{ props.children }
		</h1>
	);
}

Heading.propTypes = {
	className: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
	tag: PropTypes.string,
	variant: PropTypes.oneOf( [ 'display-1', 'display-2', 'display-3', 'display-4', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ).isRequired,
};

Heading.defaultProps = {
	className: '',
};
