import './box.scss';

export default function Box( props ) {
	const baseClassName = 'import-export-box',
		classes = [ baseClassName, props.className ];

	if ( props.variant ) {
		classes.push( baseClassName + '--' + props.variant );
	}

	return (
		<div className={ classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ) }>
			{ props.children }
		</div>
	);
}

Box.propTypes = {
	className: PropTypes.string,
	variant: PropTypes.any,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Box.defaultProps = {
	className: '',
};
