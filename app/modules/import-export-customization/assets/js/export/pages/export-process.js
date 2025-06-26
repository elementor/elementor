import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Stack, Button } from '@elementor/ui';
import { BaseLayout, TopBar, PageHeader } from '../../components';
import { useExportContext } from '../../context/export-context';

export default function ExportProcess() {
	const { data, dispatch } = useExportContext();
	const [ status, setStatus ] = useState( 'processing' ); // processing, error

	const { kitInfo, includes, plugins, isExportProcessStarted } = data;

	const HELP_URL = 'https://go.elementor.com/app-import-download-failed';

	useEffect( () => {
		if ( ! isExportProcessStarted ) {
			// Redirect back if not started from export page
			window.location.href = elementorAppConfig.base_url + '#/export-customization/';
			return;
		}

		const generateScreenshot = () => {
			return new Promise( ( resolve ) => {
				const iframe = document.createElement( 'iframe' );
				iframe.style = 'visibility: hidden;';
				iframe.width = '1200';
				iframe.height = '1000';

				const messageHandler = ( event ) => {
					if ( 'kit-screenshot-done' === event.data.name ) {
						window.removeEventListener( 'message', messageHandler );
						document.body.removeChild( iframe );
						resolve( event.data.imageUrl || null );

						window.removeEventListener( 'message', messageHandler );
					}
				};

				window.addEventListener( 'message', messageHandler );

				const previewUrl = new URL( window.location.origin );
				previewUrl.searchParams.set( 'kit_thumbnail', '1' );
				previewUrl.searchParams.set( 'nonce', elementorAppConfig[ 'import-export-customization' ].kitPreviewNonce );

				document.body.appendChild( iframe );
				iframe.src = previewUrl.toString();
			} );
		};

		const exportKit = async () => {
			try {
				setStatus( 'processing' );

				const exportData = {
					include: includes,
					kitInfo: {
						title: kitInfo.title?.trim() || null,
						description: kitInfo.description?.trim() || null,
						source: kitInfo.source,
					},
					plugins: plugins || [],
					selectedCustomPostTypes: [],
				};

				const isCloudKitFeatureActive = elementorCommon?.config?.experimentalFeatures?.[ 'cloud-library' ];

				if ( isCloudKitFeatureActive && 'cloud' === kitInfo.source ) {
					const scr = await generateScreenshot();
					exportData.screenShotBlob = scr;
				}

				const baseUrl = elementorAppConfig[ 'import-export-customization' ].restApiBaseUrl;
				const exportUrl = `${ baseUrl }/export`;

				const response = await fetch( exportUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': window.wpApiSettings?.nonce || '',
					},
					body: JSON.stringify( exportData )
				} );

				const result = await response.json();

				if ( ! response.ok ) {
					const errorMessage = result?.data?.message || `HTTP error! with the following code: ${result?.data?.code}`;
					throw new Error( errorMessage );
				}

				// Handle file export
				if ( kitInfo.source === 'file' && result.data && result.data.file ) {
					const exportedData = {
						file: result.data.file, // This is base64 encoded file data
						manifest: result.data.manifest
					};

					dispatch( { type: 'SET_EXPORTED_DATA', payload: exportedData } );
				} 
				// Handle cloud export
				else if ( kitInfo.source === 'cloud' && result.data && result.data.kit ) {
					const exportedData = {
						kit: result.data.kit
					};

					dispatch( { type: 'SET_EXPORTED_DATA', payload: exportedData } );
				}
				else {
					throw new Error( 'Invalid response format from server' );
				}

				window.location.href = elementorAppConfig.base_url + '#/export-customization/complete';

			} catch ( error ) {
				console.error( 'Export error:', error );
				setStatus( 'error' );
			}
		};

		exportKit();
	}, [ isExportProcessStarted, includes, kitInfo, plugins, dispatch ] );

	const handleTryAgain = () => {
		window.location.href = elementorAppConfig.base_url + '#/export-customization/';
	};

	const handleLearnMore = () => {
		window.open( HELP_URL, '_blank' );
	};

	const getStatusText = () => {
		if ( status === 'processing' ) {
			return __( 'Setting up your website template...', 'elementor' );
		}

		return __( 'Export failed', 'elementor' );
	};

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	return (
		<BaseLayout topBar={ <TopBar>{ headerContent }</TopBar> }>
			<Box sx={ { 
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: 'calc(100vh - 120px)',
				p: 3
			} }>
				<Box sx={ { 
					maxWidth: '600px',
					textAlign: 'center',
					width: '100%'
				} }>
				<Stack spacing={ 3 } alignItems="center">
					{ status === 'processing' && (
						<>
							<CircularProgress size={ 60 } />
							<Typography variant="h5" component="h2">
								{ getStatusText() }
							</Typography>
							<Typography variant="body1" color="text.secondary">
								{ __( 'This usually takes a few moments.', 'elementor' ) }
                                <br/>
                                { __( "Don't close this window until the process is finished.", 'elementor' ) }
							</Typography>
						</>
					) }
					
					{ status === 'error' && (
						<>
							<Box sx={ { 
								width: 60, 
								height: 60, 
								borderRadius: '50%', 
								backgroundColor: 'error.main',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontSize: '24px'
							} }>
								✕
							</Box>

							<Typography variant="h5" component="h2">
								{ getStatusText() }
							</Typography>

							<Typography variant="body1" color="text.secondary">
								{ __( 'We couldn\'t complete the export. Please try again, and if the problem persists, check our help guide for troubleshooting steps.', 'elementor' ) }
							</Typography>

							<Stack direction="row" spacing={ 2 }>
								<Button variant="contained" onClick={ handleTryAgain }>
									{ __( 'Try Again', 'elementor' ) }
								</Button>
								<Button variant="outlined" onClick={ handleLearnMore }>
									{ __( 'Learn More', 'elementor' ) }
								</Button>
							</Stack>
						</>
					) }
				</Stack>
				</Box>
			</Box>
		</BaseLayout>
	);
}
