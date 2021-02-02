import Button from 'elementor-app/ui/molecules/button';

import useLink from '../hooks/use-link';

export default function DashboardButton( props ) {
	const { action } = useLink();

	return (
		<Button
			{ ...props }
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
