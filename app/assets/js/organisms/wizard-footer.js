import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Grid from 'elementor-app/ui/grid/grid';

import './wizard-footer.scss';

export default function WizardFooter( props ) {
	const baseClassName = 'e-app-wizard-footer',
		classes = [ baseClassName, props.className ];

	if ( props.separator ) {
		classes.push( baseClassName + '__separator' );
	}

	return (
		<Grid container { ...props } className={ arrayToClassName( classes ) }>
			{ props.children }
		</Grid>
	);
}

WizardFooter.propTypes = {
	className: PropTypes.string,
	justify: PropTypes.any,
	separator: PropTypes.any,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

WizardFooter.defaultProps = {
	className: '',
};
