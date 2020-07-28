import './click-here.scss';

export default function ClickHere( props ) {
	const baseClassName = 'import-export-click-here',
		classes = [ baseClassName, props.className ];

	return (
		<div style={ style } className={ classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ) }>
			{ props.children }
		</div>
	);
}

ClickHere.propTypes = {
	className: PropTypes.string,
	variant: PropTypes.any,
	spacing: PropTypes.number,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

ClickHere.defaultProps = {
	className: '',
};
