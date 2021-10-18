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
					title={ __( 'Sorry, something went wrong', 'elementor' ) }
					text={ __( 'There is an error with enabling unfiltered files upload. The upload will continue without the SVG files.', 'elementor' ) }
					approveButtonColor="link"
					approveButtonText={ __( 'Got it', 'elementor' ) }
					approveButtonOnClick={ onReady }
					dismissButtonText={ __( 'Go back', 'elementor' ) }
					dismissButtonOnClick={ onCancel }
					onClose={ onCancel }
				/> :
				<Dialog
					title={ __( 'Enable unfiltered files upload', 'elementor' ) }
					text={ __( 'This Kit might use unfiltered files (SVG), note that this kind of file might include a security risk when provided from an unknown source. Elementor does run a process to remove possible malicious code, but there is still risk involved when using such files.', 'elementor' ) }
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
