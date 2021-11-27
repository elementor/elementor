import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Box from 'elementor-app/ui/atoms/box';
import Grid from 'elementor-app/ui/grid/grid';
import GoProButton from 'elementor-app/molecules/go-pro-button';

import './pro-banner.scss';

export default function ProBanner( { status } ) {
	if ( ! status ) {
		return null;
	}

	const data = {};

	if ( 'active' === status ) {
		data.description = __( 'Elementor Pro is installed & Activated', 'elementor' );
	} else if ( 'inactive' === status ) {
		data.heading = __( 'Connect & Activate Elementor Pro', 'elementor' );
		data.description = __( 'Without Elementor Pro, importing components like templates, widgets and popups won\'t work.', 'elementor' );
		data.button = <GoProButton text={ __( 'Connect & Activate', 'elementor' ) } />;
	} else {
		data.heading = __( 'Install Elementor Pro', 'elementor' );
		data.description = __( 'Without Elementor Pro, importing components like templates, widgets and popups won\'t work.', 'elementor' );
		data.button = <GoProButton />;
	}

	return (
		<Box className="e-app-import-plugins-pro-banner" padding="20">
			<Grid container alignItems="center" justify="space-between">
				<Grid item>
					{
						data.heading &&
						<Heading className="e-app-import-plugins-pro-banner__heading" variant="h3" tag="h3">
							{ data.heading }
						</Heading>
					}

					{
						data.description &&
						<Text className="e-app-import-plugins-pro-banner__description">
							{ data.description }
						</Text>
					}
				</Grid>

				{
					data.button &&
					<Grid item>
						{ data.button }
					</Grid>
				}
			</Grid>
		</Box>
	);
}

ProBanner.propTypes = {
	status: PropTypes.string,
};

ProBanner.defaultProps = {
	status: '',
};
