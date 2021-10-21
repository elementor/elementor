import { useState, useEffect } from 'react';

import Dialog from 'elementor-app/ui/dialog/dialog';

import useAjax from 'elementor-app/hooks/use-ajax';

export default function UnfilteredFilesDialog( props ) {
	const { show, setShow, onReady, onCancel } = props,
		{ ajaxState, setAjax } = useAjax(),
		[ enableUnfilteredFiles, setEnableUnfilteredFiles ] = useState( false ),
		[ isEnableError, setIsEnableError ] = useState( false );

	// Sending the enable unfiltered files request.
	useEffect( () => {
		if ( enableUnfilteredFiles ) {
			setShow( false );

			setAjax( {
				data: {
					action: 'elementor_ajax',
					actions: JSON.stringify( {
						enable_unfiltered_files_upload: {
							action: 'enable_unfiltered_files_upload',
						},
					} ),
				},
			} );
		}
	}, [ enableUnfilteredFiles ] );

	// Enabling unfiltered files ajax status.
	useEffect( () => {
		switch ( ajaxState.status ) {
			case 'success':
				onReady();
				break;
			case 'error':
				setIsEnableError( true );
				setShow( true );
				break;
		}
	}, [ ajaxState ] );

	if ( ! show ) {
		return null;
	}

	return (
		<>
			{
				isEnableError ?
				<Dialog
					title={ __( 'Sorry, something went wrong.', 'elementor' ) }
					text={ __( 'Nothing to worry about, just continue without importing SVGs or go back and start the import again.', 'elementor' ) }
					approveButtonColor="link"
					approveButtonText={ __( 'Got it', 'elementor' ) }
					approveButtonOnClick={ onReady }
					dismissButtonText={ __( 'Go back', 'elementor' ) }
					dismissButtonOnClick={ onCancel }
					onClose={ onCancel }
				/> :
				<Dialog
					title={ __( 'First, enable unfiltered file uploads.', 'elementor' ) }
					text={ __( 'This allows Elementor to scan your SVGs for malicious content. Otherwise, you can skip any SVGs in this import.', 'elementor' ) }
					approveButtonColor="link"
					approveButtonText={ __( 'Enable', 'elementor' ) }
					approveButtonOnClick={ () => setEnableUnfilteredFiles( true ) }
					dismissButtonText={ __( 'Skip', 'elementor' ) }
					dismissButtonOnClick={ onReady }
					onClose={ onReady }
				/>
			}
		</>
	);
}

UnfilteredFilesDialog.propTypes = {
	show: PropTypes.bool,
	setShow: PropTypes.func.isRequired,
	onReady: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
};

UnfilteredFilesDialog.defaultProps = {
	show: false,
};
