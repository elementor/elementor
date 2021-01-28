import Dialog from 'elementor-app/ui/dialog/dialog';

import useLink from '../../hooks/use-link/use-link';

export default function ImportFailedDialog( props ) {
	const { action } = useLink();

	return (
		<Dialog
			title={ __( 'Import Failed', 'elementor' ) }
			text={ __( 'We are sorry, but some problem accrued. Please try again. If the problem continues, contact our support.', 'elementor' ) }
			approveButtonColor="primary"
			approveButtonText={ __( 'Retry', 'elementor' ) }
			approveButtonOnClick={ props.onRetry }
			dismissButtonText={ __( 'Exit', 'elementor' ) }
			dismissButtonOnClick={ action.backToDashboard }
		/>
	);
}

ImportFailedDialog.propTypes = {
	onRetry: PropTypes.func.isRequired,
};
