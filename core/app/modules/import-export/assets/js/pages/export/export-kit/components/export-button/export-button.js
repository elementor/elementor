import { Context } from '../../../../../context/export/export-context';

import Button from 'elementor-app/ui/molecules/button';

export default function ExportButton() {
	const getDownloadUrl = ( exportContext, isDownloadAllowed ) => {
			if ( ! isDownloadAllowed ) {
				return '';
			}

			const exportURL = elementorAppConfig[ 'import-export' ].exportURL,
				exportData = {
					elementor_export_kit: {
						include: exportContext.data.includes,
					},
				};

			return exportURL + '&' + jQuery.param( exportData );
	};

	return (
		<Context.Consumer>
			{
				( exportContext ) => {
					const isDownloadAllowed = exportContext.data.includes.length,
						downloadURL = getDownloadUrl( exportContext, isDownloadAllowed );

					return (
						<Button
							variant="contained"
							text={ __( 'Export', 'elementor' ) }
							color={ isDownloadAllowed ? 'primary' : 'disabled' }
							url="complete"
							onClick={ () => {
								if ( isDownloadAllowed ) {
									exportContext.dispatch( { type: 'SET_DOWNLOAD_URL', payload: downloadURL } );
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
