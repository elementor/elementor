import Button from 'elementor-app/ui/molecules/button';

import useAction from '../hooks/use-action';

import Utils from 'elementor-app/utils/utils.js';

export default function DashboardButton( props ) {
	const action = useAction(),
		baseClassName = 'e-app-dashboard-button',
		classes = [ baseClassName, props.className ];

	return (
		<Button
			{ ...props }
			className={ Utils.arrayToClassName( classes ) }
			text={ __( 'Back to dashboard', 'elementor' ) }
			onClick={ action.backToDashboard }
		/>
	);
}

DashboardButton.propTypes = {
	className: PropTypes.string,
};

DashboardButton.defaultProps = {
	className: '',
	variant: 'contained',
	color: 'primary',
};
