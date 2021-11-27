import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Box from 'elementor-app/ui/atoms/box';
import Grid from 'elementor-app/ui/grid/grid';
import GoProButton from 'elementor-app/molecules/go-pro-button';

import './pro-banner.scss';

export default function ProBanner() {
	return (
		<Box className="e-app-import-plugins-pro-banner" padding="20">
			<Grid container alignItems="center" justify="space-between">
				<Grid item>
					<Heading className="e-app-import-plugins-pro-banner__heading" variant="h3" tag="h3">
						{ __( 'Install Elementor Pro', 'elementor' ) }
					</Heading>

					<Text className="e-app-import-plugins-pro-banner__description">
						{ __( 'Without Elementor Pro, importing components like templates, widgets and popups won\'t work.', 'elementor' ) }
					</Text>
				</Grid>

				<Grid item>
					<GoProButton />
				</Grid>
			</Grid>
		</Box>
	);
}
