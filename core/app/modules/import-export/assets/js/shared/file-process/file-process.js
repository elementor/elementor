import { arrayToClassName } from 'elementor-app/utils/utils.js';

import ProcessFailedDialog from '../process-failed-dialog/process-failed-dialog';
import WizardStep from '../../ui/wizard-step/wizard-step';

export default function FileProcess( props ) {
	return (
		<WizardStep
			className={ arrayToClassName( [ 'e-app-import-export-file-process', props.className ] ) }
			icon="eicon-loading eicon-animation-spin"
			// eslint-disable-next-line @wordpress/i18n-ellipsis
			heading={ __( 'Setting up your kit...', 'elementor' ) }
			description={
				<>
					{ __( 'This usually takes a few moments.', 'elementor' ) }
					<br />
					{ __( "Don't close this window until the process is finished.", 'elementor' ) }
				</>
			}
			info={ props.info }
		>
			{ ! ! props.errorType &&
				<ProcessFailedDialog
					onApprove={ props.onDialogApprove }
					onDismiss={ props.onDialogDismiss }
					errorType={ props.errorType }
					// onModalClose={ () => {
					// 	$e.run(
					// 		'kit-library/modal-close',
					// 		{},
					// 		{
					// 			meta: {
					// 				event: 'error modal close',
					// 				source: 'import',
					// 				step: '1',
					// 				event_type: 'load',
					// 			},
					// 		},
					// 	)
					// } }
					// isError={ () => {
					// 	$e.run(
					// 		'kit-library/modal-error',
					// 		{
					// 			errorType: `error modal load  ${ errorType }`,
					// 		},
					// 		{
					// 			meta: {
					// 				source: 'import',
					// 				step: '1',
					// 				event_type: 'load',
					// 			},
					// 		},
					// 	)
					// } }
					// learnMoreEvent={ () => $e.run(
					// 	'kit-library/seek-more-info',
					// 	{},
					// 	{
					// 		meta: {
					// 			event: 'error modal learn more',
					// 			source: 'import',
					// 			step: '1',
					// 		},
					// 	},
					// ) }
				/>
			}
		</WizardStep>
	);
}

FileProcess.propTypes = {
	className: PropTypes.string,
	onDialogApprove: PropTypes.func,
	onDialogDismiss: PropTypes.func,
	errorType: PropTypes.string,
	info: PropTypes.string,
};

FileProcess.defaultProps = {
	className: '',
};
