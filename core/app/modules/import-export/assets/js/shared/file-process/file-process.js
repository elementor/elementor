import { arrayToClassName } from 'elementor-app/utils/utils.js';

import ImportFailedDialog from '../import-failed-dialog/import-failed-dialog';
import WizardStep from '../../ui/wizard-step/wizard-step';

export default function FileProcess( props ) {
	return (
		<WizardStep
			className={ arrayToClassName( [ 'e-app-import-export-file-process', props.className ] ) }
			icon="eicon-loading eicon-animation-spin"
			heading={ __( 'Setting up your kit...', 'elementor' ) }
			description={
				<>
					{ __( 'This usually takes a few moments.', 'elementor' ) }
					<br />
					{ __( "Don't close this window until the process is finished.", 'elementor' ) }
				</>
			}
		>
			{ props.isError &&
			<ImportFailedDialog
				onApprove={ props.onDialogApprove }
				onDismiss={ props.onDialogDismiss }
			/>
			}
		</WizardStep>
	);
}

FileProcess.propTypes = {
	className: PropTypes.string,
	onDialogApprove: PropTypes.func.isRequired,
	onDialogDismiss: PropTypes.func.isRequired,
	isError: PropTypes.bool,
};

FileProcess.defaultProps = {
	className: '',
	isError: false,
};
