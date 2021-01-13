import { Context } from '../../../../context/kit-context';

import Button from 'elementor-app/ui/molecules/button';

export default function DownloadButton( props ) {
	const getDownloadUrl = ( context, isDownloadAllowed ) => {
		if ( ! isDownloadAllowed ) {
			return '';
		}

		const currentBaseUrl = window.location.origin + window.location.pathname + window.location.search,
			queryConnection = currentBaseUrl.indexOf( '?' ) > -1 ? '&' : '?',
			currentPostTypes = context.includes.includes( 'content' ) ? context.postTypes : [],
			exportData = {
				elementor_export_kit: {
					title: context.title,
					include: context.includes,
					post_types: currentPostTypes,
				},
			};

		return currentBaseUrl + queryConnection + jQuery.param( exportData ) + window.location.hash;
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
							text={ __( 'Next', 'elementor' ) }
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

DownloadButton.propTypes = {
	setIsDownloading: PropTypes.func,
};
