import { useState, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../../../context/export/export-context';

import Button from 'elementor-app/ui/molecules/button';

export default function ExportButton() {
	const [ isDownloading, setIsDownloading ] = useState( false ),
		navigate = useNavigate(),
		getDownloadUrl = ( context, isDownloadAllowed ) => {
			if ( ! isDownloadAllowed ) {
				return '';
			}

			const exportURL = elementorAppConfig[ 'import-export' ].exportURL,
				exportData = {
					elementor_export_kit: {
						include: context.kitContent.includes,
					},
				};

			return exportURL + '&' + jQuery.param( exportData );
	};

	useEffect( () => {
		if ( isDownloading ) {
			navigate( 'export/complete' );
		}
	}, [ isDownloading ] );

	return (
		<Context.Consumer>
			{
				( context ) => {
					const isDownloadAllowed = context.kitContent.includes.length,
						downloadURL = getDownloadUrl( context, isDownloadAllowed );

					return (
						<Button
							variant="contained"
							text={ __( 'Export', 'elementor' ) }
							color={ isDownloadAllowed ? 'primary' : 'disabled' }
							url={ downloadURL }
							onClick={ () => {
								if ( isDownloadAllowed ) {
									context.dispatch( { type: 'SET_DOWNLOAD_URL', payload: downloadURL } );
									setIsDownloading( true );
								}
							} }
						/>
					);
				}
			}
		</Context.Consumer>
	);
}

ExportButton.propTypes = {
	setIsDownloading: PropTypes.func,
};
