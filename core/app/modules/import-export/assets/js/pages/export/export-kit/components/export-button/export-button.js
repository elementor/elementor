import { Context } from '../../../../../context/kit-context';

import Button from 'elementor-app/ui/molecules/button';

export default function ExportButton( props ) {
	const getDownloadUrl = ( context, isDownloadAllowed ) => {
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

	return (
		<Context.Consumer>
			{
				( context ) => {
					const isDownloadAllowed = context.kitContent.includes.length,
						downloadURL = getDownloadUrl( context, isDownloadAllowed );

					return (
						<Button
							variant="contained"
							size="lg"
							text={ __( 'Export', 'elementor' ) }
							color={ isDownloadAllowed ? 'primary' : 'disabled' }
							url={ downloadURL }
							onClick={ () => {
								if ( isDownloadAllowed ) {
									props.setIsDownloading( true );
									context.dispatch( { type: 'SET_DOWNLOAD_URL', value: downloadURL } );
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
