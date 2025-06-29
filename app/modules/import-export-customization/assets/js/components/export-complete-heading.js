import { Typography, Link } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function ExportCompleteHeading( { isCloudExport } ) {
	return (
		<>
			<Typography variant="h4" component="h2" gutterBottom>
				{ isCloudExport
					? __( 'Your website template is now saved to the library!', 'elementor' )
					: __( 'Your .zip file is ready', 'elementor' )
				}
			</Typography>

			<Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
				{ isCloudExport
					? (
						<>
							{ __( 'You can find it in the My Website Templates tab.', 'elementor' ) }{ ' ' }
							<Link
								href={ elementorAppConfig.base_url + '#/kit-library/cloud' }
								sx={ { cursor: 'pointer' } }
							>
								{ __( 'Take me there', 'elementor' ) }
							</Link>
						</>
					)
					: __( 'Once the download is complete, you can upload it to be used for other sites.', 'elementor' )
				}
			</Typography>
		</>
	);
}

ExportCompleteHeading.propTypes = {
	isCloudExport: PropTypes.bool.isRequired,
};
