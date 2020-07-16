import Grid from 'elementor-app/ui/grid/grid';

import './footer.scss';

export default function Footer( props ) {
	const baseClassName = 'import-export-footer',
		classes = [ baseClassName, props.className ];

	if ( props.separator ) {
		classes.push( baseClassName + '__separator' );
	}

	return (
		<Grid container { ...props } className={ classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ) }>
			{ props.children }
		</Grid>
	);
}

Footer.propTypes = {
	className: PropTypes.string,
	justify: PropTypes.any,
	separator: PropTypes.any,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Footer.defaultProps = {
	className: '',
};
