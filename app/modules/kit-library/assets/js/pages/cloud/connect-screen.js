import { useRef, useEffect } from 'react';
import { Heading, Text, Grid, Button } from '@elementor/app-ui';
import PropTypes from 'prop-types';
import Content from '../../../../../../assets/js/layout/content';
import IndexHeader from '../index/index-header';
import IndexSidebar from '../index/index-sidebar';
import Layout from '../../components/layout';

export default function ConnectScreen( { 
	onConnectSuccess, 
	onConnectError,
	menuItems,
	forceRefetch,
	isFetching
} ) {
	const connectButtonRef = useRef();

	useEffect( () => {
		if ( ! connectButtonRef.current ) {
			return;
		}

		jQuery( connectButtonRef.current ).elementorConnect( {
			popup: {
				width: 600,
				height: 700,
			},
			success: ( data ) => {
				elementorCommon.config.library_connect.is_connected = true;
				elementorCommon.config.library_connect.current_access_level = data.kits_access_level || data.access_level || 0;
				elementorCommon.config.library_connect.current_access_tier = data.access_tier;

				onConnectSuccess?.();
			},
			error: () => {
				elementorCommon.config.library_connect.is_connected = false;
				elementorCommon.config.library_connect.current_access_level = 0;
				elementorCommon.config.library_connect.current_access_tier = '';

				onConnectError?.();
			},
		} );
	}, [ onConnectSuccess, onConnectError ] );

	return (
		<Layout
			sidebar={
				<IndexSidebar menuItems={ menuItems } />
			}
			header={
				<IndexHeader
					refetch={ () => {
						forceRefetch();
					} }
					isFetching={ isFetching }
				/>
			}
		>
			<div className="e-kit-library__index-layout-container">
				<Content className="e-kit-library__index-layout-main e-kit-library__connect-container">
					<Grid container alignItems="center" justify="center" direction="column" className="e-kit-library__error-screen">
						<i className="eicon-library-cloud-connect" aria-hidden="true"></i>
						<Heading
							tag="h3"
							variant="display-1"
							className="e-kit-library__error-screen-title"
						>
							{ __( 'Connect to your Elementor account', 'elementor' ) }
						</Heading>
						<Text variant="xl" className="e-kit-library__error-screen-description">
							{ __( 'Then you can find all your templates in one convenient library.', 'elementor' ) }
						</Text>
						<Button
							elRef={ connectButtonRef }
							text={ __( 'Connect', 'elementor' ) }
							url={ elementorAppConfig?.[ 'cloud-library' ]?.library_connect_url?.replace(/&#038;/g, '&') }
							className="e-kit-library__connect-button"
						/>
					</Grid>
				</Content>
			</div>
		</Layout>
	);
}

ConnectScreen.propTypes = {
	onConnectSuccess: PropTypes.func,
	onConnectError: PropTypes.func,
	menuItems: PropTypes.array.isRequired,
	forceRefetch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
};
