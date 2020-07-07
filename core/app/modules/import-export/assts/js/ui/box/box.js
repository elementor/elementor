import './box.scss';

export default function Box( props ) {
	const baseClassName = 'import-export-box',
		classes = [ baseClassName, props.className ];

	if ( props.type ) {
		classes.push( baseClassName + '--' + props.type );
	}

	return (
		<div className={ classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ) }>
			{ props.children }
		</div>
	);
}

Box.propTypes = {
	className: PropTypes.string,
	type: PropTypes.any,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Box.defaultProps = {
	className: '',
};
