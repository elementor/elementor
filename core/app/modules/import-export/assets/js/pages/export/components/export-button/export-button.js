import { Context } from '../../../../context/kit-context';

import Button from 'elementor-app/ui/molecules/button';

export default function ExportButton( props ) {
	const getDownloadUrl = ( context, isDownloadAllowed ) => {
		if ( ! isDownloadAllowed ) {
			return '';
		}

		const exportURL = elementorAppConfig[ 'import-export' ].exportURL,
			exportData = {
				elementor_export_kit: {
					include: context.includes,
				},
			};

		return exportURL + '&' + jQuery.param( exportData );
	};

	return (
		<Context.Consumer>
			{
				( context ) => {
					const isDownloadAllowed = context.kitContent.includes.length;

					return (
						<Button
							variant="contained"
							size="lg"
							text={ __( 'Export', 'elementor' ) }
							color={ isDownloadAllowed ? 'primary' : 'disabled' }
							url={ getDownloadUrl( context.kitContent, isDownloadAllowed ) }
							onClick={ () => {
								if ( isDownloadAllowed ) {
									props.setIsDownloading( true );
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
