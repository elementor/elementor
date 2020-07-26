import './box.scss';

export default function Box( props ) {
	const baseClassName = 'import-export-box',
		classes = [ baseClassName, props.className ],
		style = {
			'--import-export-box-spacing': props.spacing || 0,
		};

	if ( props.variant ) {
		classes.push( baseClassName + '--' + props.variant );
	}

	return (
		<div style={ style } className={ classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ) }>
			{ props.children }
		</div>
	);
}

Box.propTypes = {
	className: PropTypes.string,
	variant: PropTypes.any,
	spacing: PropTypes.number,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Box.defaultProps = {
	className: '',
};
