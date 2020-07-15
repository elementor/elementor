import { ExportConsumer } from '../../../../context/export';

import Button from 'elementor-app/ui/molecules/button';

export default function DownloadButton() {
	const getDownloadUrl = ( data ) => {
		const currentBaseUrl = window.location.origin + window.location.pathname + window.location.search,
			queryConnection = currentBaseUrl.indexOf( '?' ) > -1 ? '&' : '?',
			exportData = {
				elementor_export: {
					title: data.title,
					include: data.includes,
					custom_post_types: data.postTypes,
				},
			};

		return currentBaseUrl + queryConnection + jQuery.param( exportData ) + window.location.hash;
	};

	console.log( 'RE-RENDER DOWNLOAD BUTTON222' );
	return (
		<ExportConsumer>
			{
				( context ) => {
					return <Button url={ getDownloadUrl( context ) } target="_blank" variant="contained" size="lg" color="primary" text={ __( 'Next', 'elementor' ) } />
				}
			}
		</ExportConsumer>
	);
}
