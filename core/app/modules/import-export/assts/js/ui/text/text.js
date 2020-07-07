import './text.scss';

export default function Text( props ) {
	const baseClassName = 'import-export-text',
		classes = [
			baseClassName,
			props.className,
		],
		tagName = props.tag || 'p';

	if ( props.size ) {
		classes.push( baseClassName + '--' + props.size );
	}

	return React.createElement( tagName, {
		className: classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ),
	}, props.children );
}

Text.propTypes = {
	className: PropTypes.string,
	size: PropTypes.string.isRequired,
	tag: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Text.defaultProps = {
	className: '',
};
