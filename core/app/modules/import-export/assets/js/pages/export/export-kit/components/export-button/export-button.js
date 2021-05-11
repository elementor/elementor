import { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../../../context/export/export-context';

import Button from 'elementor-app/ui/molecules/button';

export default function ExportButton() {
	const exportContext = useContext( Context ),
		navigate = useNavigate(),
		[ isDownloadAllowed, setIsDownloadAllowed ] = useState( false ),
		getDownloadUrl = () => {
			const exportURL = elementorAppConfig[ 'import-export' ].exportURL,
				exportData = {
					elementor_export_kit: {
						include: exportContext.data.includes,
					},
				};

			return exportURL + '&' + jQuery.param( exportData );
	};

	useEffect( () => {
		setIsDownloadAllowed( ! ! exportContext.data.includes.length );
	}, [ exportContext.data.includes ] );

	useEffect( () => {
		if ( exportContext.data.downloadUrl ) {
			navigate( '/export/process' );
		}
	}, [ exportContext.data.downloadUrl ] );

	return (
		<Button
			variant="contained"
			text={ __( 'Export', 'elementor' ) }
			color={ isDownloadAllowed ? 'primary' : 'disabled' }
			onClick={ () => {
				if ( isDownloadAllowed ) {
					exportContext.dispatch( { type: 'SET_DOWNLOAD_URL', payload: getDownloadUrl() } );
				}
			} }
		/>
	);
}

ExportButton.propTypes = {
	setIsDownloading: PropTypes.func,
};
