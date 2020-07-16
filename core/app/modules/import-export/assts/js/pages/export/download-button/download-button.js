import { ExportConsumer } from '../../../context/export';

import Button from 'elementor-app/ui/molecules/button';

export default function DownloadButton( props ) {
	const getDownloadUrl = ( data ) => {
		const currentBaseUrl = window.location.origin + window.location.pathname + window.location.search,
			queryConnection = currentBaseUrl.indexOf( '?' ) > -1 ? '&' : '?',
			exportData = {
				elementor_export_kit: {
					title: data.title,
					include: data.includes,
					custom_post_types: data.postTypes,
				},
			};

		return currentBaseUrl + queryConnection + jQuery.param( exportData ) + window.location.hash;
	};

	return (
		<ExportConsumer>
			{
				( context ) => (
					<Button
						url={ getDownloadUrl( context ) }
						onClick={ () => props.setIsDownloading(true) }
						target="_blank"
						variant="contained"
						size="lg"
						color="primary"
						text={ __( 'Next', 'elementor' ) }
					/>
				)
			}
		</ExportConsumer>
	);
}

DownloadButton.propTypes = {
	setIsDownloading: PropTypes.func,
};
