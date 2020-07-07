import './heading.scss';

export default function Heading( props ) {
	const baseClassName = 'import-export-heading',
		classes = [
			baseClassName,
			props.className,
		],
		tagName = props.tag || 'h1';

	if ( props.size ) {
		classes.push( baseClassName + '--' + props.size );
	}

	return React.createElement( tagName, {
		className: classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ),
	}, props.children );
}

Heading.propTypes = {
	className: PropTypes.string,
	size: PropTypes.string.isRequired,
	variant: PropTypes.string, // page-title etc.
	tag: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Heading.defaultProps = {
	className: '',
};
