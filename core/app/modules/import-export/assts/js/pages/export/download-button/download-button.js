import { ExportConsumer } from '../../../context/export';

import Button from 'elementor-app/ui/molecules/button';

export default function DownloadButton( props ) {
	const getDownloadUrl = ( context, isDownloadAllowed ) => {
		if ( ! isDownloadAllowed ) {
			return '';
		}

		const currentBaseUrl = window.location.origin + window.location.pathname + window.location.search,
			queryConnection = currentBaseUrl.indexOf( '?' ) > -1 ? '&' : '?',
			exportData = {
				elementor_export_kit: {
					title: context.title,
					include: context.includes,
					custom_post_types: context.postTypes,
				},
			};

		return currentBaseUrl + queryConnection + jQuery.param( exportData ) + window.location.hash;
	};

	return (
		<ExportConsumer>
			{
				( context ) => {
					const isDownloadAllowed = context.includes.length;

					return (
						<Button
							variant="contained"
							size="lg"
							text={ __( 'Next', 'elementor' ) }
							color={ isDownloadAllowed ? 'primary' : 'disabled' }
							url={ getDownloadUrl( context, isDownloadAllowed ) }
							onClick={ () => {
								if ( isDownloadAllowed ) {
									props.setIsDownloading( true );
								}
							} }
						/>
					);
				}
			}
		</ExportConsumer>
	);
}

DownloadButton.propTypes = {
	setIsDownloading: PropTypes.func,
};
