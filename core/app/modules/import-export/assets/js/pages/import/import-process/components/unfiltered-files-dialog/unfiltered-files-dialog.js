import { useState, useEffect } from 'react';

import Dialog from 'elementor-app/ui/dialog/dialog';

import useAjax from 'elementor-app/hooks/use-ajax';

export default function UnfilteredFilesDialog( props ) {
	const { show, onSelected, onError } = props,
		{ ajaxState, setAjax } = useAjax(),
		[ enableUnfilteredFiles, setEnableUnfilteredFiles ] = useState( false );

	useEffect( () => {
		if ( enableUnfilteredFiles ) {
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

	useEffect( () => {
		if ( 'success' === ajaxState.status ) {
			onSelected();
		} else if ( 'error' === ajaxState.status ) {
			onError();
		}
	}, [ ajaxState ] );

	return (
		<>
			{
				show &&
				<Dialog
					title={ __( 'Enable unfiltered files upload', 'elementor' ) }
					text={ __( 'This Kit might use unfiltered files (SVG/JSON), note that this kind of file might include a security risk when provided from an unknown source. Elementor does run a process to remove possible malicious code, but there is still risk involved when using such files.', 'elementor' ) }
					approveButtonColor="link"
					approveButtonText={ __( 'Enable', 'elementor' ) }
					approveButtonOnClick={ () => setEnableUnfilteredFiles( true ) }
					dismissButtonText={ __( 'Skip', 'elementor' ) }
					dismissButtonOnClick={ onSelected }
					onClose={ onSelected }
				/>
			}
		</>
	);
}

UnfilteredFilesDialog.propTypes = {
	show: PropTypes.bool,
	onSelected: PropTypes.func,
	onError: PropTypes.func,
};

UnfilteredFilesDialog.defaultProps = {
	show: false,
};
