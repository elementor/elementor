import { useState, useEffect } from 'react';

import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Box from 'elementor-app/ui/atoms/box';
import Grid from 'elementor-app/ui/grid/grid';
import GoProButton from 'elementor-app/molecules/go-pro-button';

import './pro-banner.scss';

export default function ProBanner( { status, onRefresh } ) {
	const [ isPendingInstallation, setIsPendingInstallation ] = useState( false ),
		data = {};

	if ( 'inactive' === status ) {
		return null;
	} else if ( isPendingInstallation ) {
		data.heading = __( 'Importing with Elementor Pro', 'elementor' );
		data.description = __( 'In a moment you’ll be redirected to install and activate Elementor Pro.', 'elementor' ) + <br /> + __( 'When you’re done, come back here and refresh this page.', 'elementor' );
		data.button = <GoProButton onClick={ onRefresh } text={ __( 'Refresh', 'elementor' ) } variant="outlined" color="cta" />;
	} else if ( 'active' === status && elementorAppConfig.is_license_connected ) {
		data.description = __( 'Elementor Pro is installed & Activated', 'elementor' );
	} else if ( 'active' === status && ! elementorAppConfig.is_license_connected ) {
		data.heading = __( 'Connect & Activate Elementor Pro', 'elementor' );
		data.description = __( 'Without Elementor Pro, importing components like templates, widgets and popups won\'t work.', 'elementor' );
		data.button = <GoProButton url={ elementorAppConfig.license_url } text={ __( 'Connect & Activate', 'elementor' ) } />;
	} else {
		data.heading = __( 'Install Elementor Pro', 'elementor' );
		data.description = __( 'Without Elementor Pro, importing components like templates, widgets and popups won\'t work.', 'elementor' );
		data.button = <GoProButton onClick={ () => setIsPendingInstallation( true ) } />;
	}

	useEffect( () => {
		if ( isPendingInstallation ) {
			setTimeout( () => {
				window.open( 'https://go.elementor.com/go-pro-import-export', '_blank' );
			}, 3000 );
		}
	}, [ isPendingInstallation ] );

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
	onRefresh: PropTypes.func,
};

ProBanner.defaultProps = {
	status: '',
};
