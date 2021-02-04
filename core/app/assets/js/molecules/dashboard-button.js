import Button from 'elementor-app/ui/molecules/button';

import useLink from '../hooks/use-link';

import Utils from 'elementor-app/utils/utils.js';

export default function DashboardButton( props ) {
	const { action } = useLink(),
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
